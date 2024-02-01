const express = require('express');
const myPageController = require('../controllers/myPage');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticate, myPageController.getProfile);

router.post('/profile', authenticate, myPageController.postProfile);

router.get('/scraps', authenticate, myPageController.getScraps);

router.get('/plans', authenticate, myPageController.getPlans);

module.exports = router;
