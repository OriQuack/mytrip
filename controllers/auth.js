const Users = require('../models/user');
const bcrypt = require('bcryptjs');

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Users.getUserByEmail(email).then((user) => {
        if (!user) {
            // TODO: send "Invalid email or password" error
            return res.redirect('/login');
        }
        // email에 대응하는 유저 존재
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                }
                // TODO: send "Invalid email or password" error
                res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);
                return res.redirect('/login');
            });
    });
};
exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) {
        // TODO: Send "password does not match" error
        console.log('password does not match');
        return res.redirect('/signup');
    }
    Users.getUserByEmail(email)
        .then((userDoc) => {
            if (userDoc) {
                // 해당 email을 가진 유저가 이미 존재
                // TODO: Send "user already exists" error
                console.log('user already exists');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    const user = new Users(username, email, hashedPassword);
                    return user.save();
                })
                .then((result) => {
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};
