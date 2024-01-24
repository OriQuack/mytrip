const express = require('express');

const planController = require('../controllers/plan');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', planController.getIndex); // 임시 메인 페이지

router.get('/protected', authenticate, planController.getProtected);

router.post('/add-plan', authenticate, planController.postAddPlan);

router.get('/share', authenticate, planController.getShareUri);

router.get('/shared-trip/:code', planController.getSharedPlan);

router.delete('/delete', authenticate, planController.deletePlan);

module.exports = router;
