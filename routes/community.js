const express = require('express');
const communityController = require('../controllers/community');
const router = express.Router();

router.get('/', communityController.getAllPosts);
router.get('/likes', communityController.getAllPostsByLikes);
router.get('/:postId', communityController.getPostById);

module.exports = router;