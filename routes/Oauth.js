const express = require('express');


const OauthController = require('../controllers/Oauth');
const router = express.Router();

router.post('/naver',OauthController.NaverLogin);

module.exports = router;
