const express = require('express');

const authController = require('../controllers/auth');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.post('/verify/username', authController.postVerifyUsername);

router.post('/verify/email', authController.postVerifyEmail);

router.delete('/signout', authenticate, authController.deleteUserData);

router.post('/google', authController.postGoogleLogin);

module.exports = router;
