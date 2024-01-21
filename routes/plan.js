const express = require('express');

const planController = require('../controllers/plan');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', planController.getIndex); // 임시 메인 페이지

module.exports = router;
