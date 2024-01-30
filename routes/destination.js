const express = require('express');

const destController = require('../controllers/destination');

const router = express.Router();
//router.get('/data/:region', destController.getRegion); //도,특별시,광역시 검색시 여행지들
router.get('/data/:region', destController.getDestByCity); //도시 검색시 추천여행지

//router.get('/data/:destination', destController.getDestination); //여행지 검색시 

module.exports = router;
