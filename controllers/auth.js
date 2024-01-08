const Users = require('../models/user');
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Invalid Email.");
        return res.redirect('/login');
        // return res.status(422).render('auth/login', {
        //     path: '/login',
        //     pageTitle: 'login',
        //     errorMessage: errors.array()[0].msg
        //     oldInput: {email: email, password: password } //Keep user data
        // });
    }

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
                    console.log('session init complete');
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                }
                // TODO: send "Invalid email or password" error
                console.log('Invalid email or password');
                res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);
                return res.redirect('/login');
            });
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    //Check the validation result
    if (!errors.isEmpty()) {//Invalid email
        console.log("Invalid signup information");
        console.log(errors.array());
        return res.redirect('/signup');
        // return res.status(422).render('auth/signup', {
        //     path: '/signup',
        //     pageTitle: 'Signup',
        //     errorMessage: errors.array()[0].msg
        //     oldInput: {username: username, email: email, password: password, confirmPassword: confirmPassword}
        // });
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new Users(username, email, hashedPassword);
            return user.save();
        })
        .then((result) => {
            console.log('signup complete!');
            res.redirect('/login');
        })
        .catch((err) => {
            console.log(err);

        })
};
