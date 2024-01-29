const mongodb = require('mongodb');
const Plan = require('../models/plan');
const User = require('../models/user');
const City = require('../models/city');

exports.getAllPosts = (req, res, next) => { //기본적으로는 최신순
    Plan.getAllSortedByDate()
        .then(posts => {
            res.status(200).json({
                posts: posts
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getAllPostsByLikes = (req, res, next) => { //좋아요순
    Plan.getAllSortedByLikes()
        .then(posts => {
            res.status(200).json({
                posts: posts
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
};

exports.getPostById = (req, res, next) => {
    const postId = req.params.postId;
    Plan.getPlanById(postId)
        .then(post => {
            res.status(200).json({
                post: post
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
};