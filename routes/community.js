const express = require('express');
const communityController = require('../controllers/community');
const checkLogin = require('../middleware/checkLogin');
const router = express.Router();

router.get('/', checkLogin, communityController.getAllPosts);

router.get('/likes', checkLogin, communityController.getAllPostsByLikes);

router.get('/:postId', checkLogin, communityController.getPostById);

module.exports = router;
