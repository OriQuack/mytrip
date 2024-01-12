const Users = require('../models/user');
const generateToken = require('../util/generateToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Users.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    const accessToken = generateToken.genAccessToken(email);
                    const refreshToken = generateToken.genRefreshToken(email);
                    return res
                        .status(200)
                        .cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                        })
                        .header('Authorization', accessToken)
                        .json({ username: user.username });
                }
                return res.status(401).json({ message: 'Incorrect password' });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({ message: 'Bad request' });
            });
    });
};

exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new Users(username, email, hashedPassword);
            return user.save();
        })
        .then((result) => {
            const accessToken = generateToken.genAccessToken(email);
            const refreshToken = generateToken.genRefreshToken(email);
            return res
                .status(200)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                })
                .header('Authorization', accessToken)
                .json({ username: username });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500);
        });
};
