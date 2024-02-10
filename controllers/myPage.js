const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');

const generateToken = require('../util/generateToken');

exports.getProfile = (req, res, next) => {
    return res.status(200).json({
        username: req.user.username,
        email: req.user.email,
        planCount: req.user.myPlans.length,
        snsLogin: req.user.snsLogin,
    });
};

exports.postProfile = (req, res, next) => {
    const username = req.body.username;
    const newPassword = req.body.password;

    bcrypt.hash(newPassword, 12).then((password) => {
        req.user.updatePassword(password).catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
    });
    req.user
        .updateUsername(username)
        .then((result) => {
            // renew access token with new username
            const accessToken = generateToken.genAccessToken(username);
            return res
                .status(200)
                .header('Authorization', accessToken)
                .json({ message: 'Updated' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.getScraps = (req, res, next) => {
    let posts = req.user.scrapPlans;
    posts = posts.map((post) => {
        const isLiked = req.user.likedPlans.some((id) => id.equals(post.planId));
        return {
            ...post,
            isLiked: isLiked,
        };
    });
    return res.status(200).json({
        scrapPlans: posts,
    });
};

exports.getPlans = (req, res, next) => {
    let posts = req.user.myPlans;
    posts = posts.map((post) => {
        const isLiked = req.user.likedPlans.some((id) => id.equals(post.planId));
        return {
            ...post,
            isLiked: isLiked,
        };
    });
    return res.status(200).json({
        myPlans: posts,
    });
};
