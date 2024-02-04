const express = require('express');
const communityController = require('../controllers/community');
const planController = require('../controllers/plan');
const checkLogin = require('../middleware/checkLogin');
const router = express.Router();

router.get('/', checkLogin, communityController.getAllPosts);

router.get('/likes', checkLogin, communityController.getAllPostsByLikes);

router.get('/:postId', checkLogin, communityController.getPostById);

router.get('/post/:city', planController.getPlanByCity);

router.post('/like/:postId', checkLogin, communityController.postLikeClick);

router.post('/scrap/:postId', checkLogin, communityController.postScrapClick);

module.exports = router;
