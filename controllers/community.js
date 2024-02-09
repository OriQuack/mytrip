const mongodb = require('mongodb');
const Plan = require('../models/plan');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.getAllPosts = (req, res, next) => {
    const { city, sort, season, cost, num, period } = req.query;

    // 기본적으로 최신순
    Plan.filterPlans(city, sort, season, cost, num, period)
        .then((posts) => {
            if (req.user) {
                // 로그인한 상태이면 각 게시물에 대해 좋아요, 스크랩 여부 확인
                posts = posts.map((post) => {
                    const isLiked = req.user.likedPlans.some((id) => id.equals(post._id));
                    const isScraped = req.user.scrapPlans.some((scrapPlan) =>
                        scrapPlan.planId.equals(post._id)
                    );
                    return {
                        ...post,
                        isLiked: isLiked,
                        isScraped: isScraped,
                    };
                });
            }
            return res.status(200).json({
                posts: posts,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getPostById = (req, res, next) => {
    let isLiked = false;
    let isScraped = false;
    const postId = new mongodb.ObjectId(req.params.postId); // postId를 ObjectId로 변환
    Plan.getPlanById(postId)
        .then((post) => {
            if (!post) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            // Post가 public인지 확인
            if (!post.isPublic || !post.isDone) {
                if (!req.user || req.user.username !== post.ownerUsername) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
            }
            if (req.user) {
                // 로그인한 상태이면 좋아요, 스크랩 여부 확인
                isLiked = req.user.likedPlans.some((id) => id.equals(postId));
                isScraped = req.user.scrapPlans.some((scrapPlan) =>
                    scrapPlan.planId.equals(postId)
                );
            }
            Comment.getCommentsByPlan(postId)
                .then((comments) => {
                    return res.status(200).json({
                        post: post,
                        comments: comments,
                        isLiked: isLiked, // 좋아요 여부 추가
                        isScraped: isScraped, // 스크랩 여부 추가
                    });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: 'Internal server error' });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.postLikeClick = (req, res, next) => {
    //req.user가 undefined 인 경우 -> 로그인 안하고 좋아요 못누름
    //req.user가 undefined가 아닌 경우
    //req.user의 likedPlans에 해당 plan id가 존재하는지 확인하여
    // (1) 존재하지 않으면, req.user의 likedPlans에 추가하고, 해당 plan의 like 수 증가시키기
    // (2) 존재하면, req.user의 likedPlans에서 삭제하고, 해당 plan의 like 수 감소시키기

    const planId = new mongodb.ObjectId(req.params.postId);
    const isLiked = req.user.likedPlans.some((id) => id.equals(planId));

    Plan.getPlanById(planId)
        .then((planData) => {
            // planData를 Plan 클래스의 인스턴스로 변환
            const plan = new Plan(planData);

            if (isLiked) {
                // 이미 좋아요 한 게시물
                return req.user
                    .removeLikedPlan(planId)
                    .then(() => {
                        plan.likes -= 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Like removed'));
            } else {
                // 좋아요 하지 않은 게시물
                return req.user
                    .addLikedPlan(planId)
                    .then(() => {
                        plan.likes += 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Like added'));
            }
        })
        .catch((err) => {
            // 에러 처리
            console.error(err);
            return res.status(500).send('Internal server error');
        });
};

exports.postScrapClick = (req, res, next) => {
    const planId = new mongodb.ObjectId(req.params.postId);
    const isScraped = req.user.scrapPlans.some((scrapPlan) => scrapPlan.planId.equals(planId));

    Plan.getPlanById(planId)
        .then((planData) => {
            // planData를 Plan 클래스의 인스턴스로 변환
            const plan = new Plan(planData);

            if (isScraped) {
                // 이미 스크랩 한 게시물
                return req.user
                    .removeScrapPlan(planId)
                    .then(() => {
                        plan.scraps -= 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Scrap removed'));
            } else {
                // 스크랩 하지 않은 게시물
                return req.user
                    .addScrapPlan(plan)
                    .then(() => {
                        plan.scraps += 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Scrap added'));
            }
        })
        .catch((err) => {
            // 에러 처리
            console.error(err);
            return res.status(500).send('Internal server error');
        });
};

exports.postAddComment = (req, res, next) => {
    const planId = new mongodb.ObjectId(req.params.postId);
    const content = req.body.content;
    const dateObject = new Date();
    const date = dateObject.toISOString().split('T')[0].replace(/-/g, '.');
    const time = dateObject.getHours() + ':' + dateObject.getMinutes();
    const comment = new Comment({
        _id: null,
        planId: planId,
        userId: req.user._id,
        content: content,
        date: date + ' ' + time,
    });
    // comments collection에 comment 추가
    comment
        .save()
        .then((result) => {
            return res.status(201).json({ commentId: result.insertedId });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.deleteComment = (req, res, next) => {
    const planId = new mongodb.ObjectId(req.params.postId);
    const commentId = new mongodb.ObjectId(req.body.commentId);
    Plan.getPlanById(planId)
        .then((plan) => {
            // comments collection에서 comment 삭제
            Comment.getCommentById(commentId)
                .then((comment) => {
                    if (!comment) {
                        return res.status(404).json({ message: 'Comment not found' });
                    }
                    // 유저 확인
                    if (comment.userId.toString() !== req.user._id.toString()) {
                        return res.status(403).json({ message: 'Unauthorized' });
                    }
                    const updatingComment = new Comment(comment);
                    updatingComment
                        .deleteComment()
                        .then((result) => {
                            return res.status(200).json({ message: 'Successfully deleted' });
                        })
                        .catch((err) => {
                            return res.status(500).json({ message: 'Internal server error' });
                        });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Internal server error' });
                });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getUserPosts = (req, res, next) => {
    const username = req.params.username;
    User.getUserByUsername(username)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            let posts = user.myPlans.filter((plan) => {
                return plan.isPublic && plan.isDone;
            });
            if (req.user) {
                // 로그인한 상태이면 각 게시물에 대해 좋아요, 스크랩 여부 확인
                posts = posts.map((post) => {
                    const isLiked = req.user.likedPlans.some((id) => id.equals(post._id));
                    const isScraped = req.user.scrapPlans.some((scrapPlan) =>
                        scrapPlan.planId.equals(post._id)
                    );
                    return {
                        ...post,
                        isLiked: isLiked,
                        isScraped: isScraped,
                    };
                });
            }
            return res.status(200).json({
                posts: posts,
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};
