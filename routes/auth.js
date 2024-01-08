const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

// router.get('/login', authController.getLogin);

// router.get('/signup', authController.getSignup);

router.post('/login', body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(), authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/signup',
    [
        body('username').custom((value, { req }) => {
            return User.getUserByUsername(value)
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'Username exists already, please pick a different one.'
                        );
                    }
                });
        }),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.getUserByEmail(value)
                    .then((userDoc) => {
                        if (userDoc) {
                            // 해당 email을 가진 유저가 이미 존재
                            // TODO: Send "user already exists" error
                            console.log('user already exists');
                            return Promise.reject('E-mail exists already, please pick a different one.');
                        }
                    })
            })
            .normalizeEmail(),
        body('password', 'Please enter a valid password.')
            .isLength({ min: 5 })
            .matches(/\d/)
            .matches(/[A-Z]/)
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .matches(/[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/)
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords does not match.');
                }
                return true;
            })
    ],
    authController.postSignup);

module.exports = router;
