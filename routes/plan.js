const express = require('express');

const planController = require('../controllers/plan');

const router = express.Router();

router.get('/', planController.getIndex);  // 임시 메인 페이지

module.exports = router;