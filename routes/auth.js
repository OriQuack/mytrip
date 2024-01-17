const express = require('express');

const authController = require('../controllers/auth');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);



router.post('/reset', authController.postReset);



router.post('/new-password', authController.postNewPassword);

router.post('/verify/username', authController.postVerifyUsername);

router.post('/verify/email', authController.postVerifyEmail);

router.delete('/signout', authenticate, authController.deleteUserData);

module.exports = router;
