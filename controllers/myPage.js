const mongodb = require('mongodb');

const Plan = require('../models/plan');
const User = require('../models/user');

exports.getProfile = (req, res, next) => {
    return res.status(200).json({
        username: req.user.username,
        email: req.user.email,
        planCount: req.user.myPlans.length,
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
    return res.status(200).json({
        scrapPlans: req.user.scrapPlans,
    });
};

exports.getPlans = (req, res, next) => {
    return res.status(200).json({
        myPlans: req.user.myPlans,
    });
};
