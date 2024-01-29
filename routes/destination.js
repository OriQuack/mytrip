const express = require('express');

const destController = require('../controllers/destination');

const router = express.Router();

router.get('/planning/data/:region', destController.getDestByCity); //도시 검색시 추천여행지

router.get('/planning/data/:destination', destController.getDestination); //여행지 검색시 

module.exports = router;
