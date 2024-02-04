const mongodb = require('mongodb');
const Plan = require('../models/plan');
const User = require('../models/user');
const City = require('../models/city');

exports.getAllPosts = (req, res, next) => { //기본적으로는 최신순
    Plan.getAllSortedByDate()
        .then(posts => {
            return res.status(200).json({
                posts: posts
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getAllPostsByLikes = (req, res, next) => { //좋아요순
    Plan.getAllSortedByLikes()
        .then(posts => {
            return res.status(200).json({
                posts: posts
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getPostById = (req, res, next) => {
    const postId = req.params.postId;
    Plan.getPlanById(postId)
        .then(post => {
            return res.status(200).json({
                post: post
            });
        })
        .catch(err => {
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

    if (!req.user) {
        return res.status(401).send('User not authenticated');
    }
    const planId = new mongodb.ObjectId(req.params.postId);
    const isLiked = req.user.likedPlans.some(id => id.equals(planId));

    Plan.getPlanById(planId)
        .then(planData => {
            // planData를 Plan 클래스의 인스턴스로 변환
            const plan = new Plan(planData);

            if (isLiked) {
                // 이미 좋아요 한 게시물
                return req.user.removeLikedPlan(planId)
                    .then(() => {
                        plan.likes -= 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Like removed'));
            } else {
                // 좋아요 하지 않은 게시물
                return req.user.addLikedPlan(planId)
                    .then(() => {
                        plan.likes += 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Like added'));
            }
        })
        .catch(err => {
            // 에러 처리
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
};


exports.postScrapClick = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send('User not authenticated');
    }
    const planId = new mongodb.ObjectId(req.params.postId);
    const isScraped = req.user.scrapPlans.some(scrapPlan => scrapPlan.planId.equals(planId));


    Plan.getPlanById(planId)
        .then(planData => {
            // planData를 Plan 클래스의 인스턴스로 변환
            const plan = new Plan(planData);

            if (isScraped) {
                // 이미 스크랩 한 게시물
                return req.user.removeScrapPlan(planId)
                    .then(() => {
                        plan.scraps -= 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Scrap removed'));
            } else {
                // 스크랩 하지 않은 게시물
                return req.user.addScrapPlan(plan)
                    .then(() => {
                        plan.scraps += 1;
                        return plan.save();
                    })
                    .then(() => res.status(200).send('Scrap added'));
            }
        })
        .catch(err => {
            // 에러 처리
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
};