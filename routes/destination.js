const express = require('express');

const destController = require('../controllers/destination');

const router = express.Router();

router.get('/get-destination-by-city', destController.getDestByCity);

router.get('/get-destination', destController.getDestination);

module.exports = router;
