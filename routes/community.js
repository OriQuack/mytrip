const express = require('express');
const communityController = require('../controllers/community');
const planController = require('../controllers/plan');
const checkLogin = require('../middleware/checkLogin');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.get('/', checkLogin, communityController.getAllPostsByLikes);

router.get('/recent', checkLogin, communityController.getAllPosts);

router.get('/:postId', checkLogin, communityController.getPostById);

router.get('/post/:city', planController.getPlanByCity);

router.post('/:postId/like', authenticate, communityController.postLikeClick);

router.post('/:postId/scrap', authenticate, communityController.postScrapClick);

router.post('/:postId/comment/add', authenticate, communityController.postAddComment);

router.delete('/:postId/comment/delete', authenticate, communityController.deleteComment);

module.exports = router;
