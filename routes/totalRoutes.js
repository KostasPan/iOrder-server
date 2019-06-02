const express = require('express');
const router = express.Router();

const TotalCtrl = require('../controllers/totals');
const authHelper = require('../helpers/authHelper');

router.get('/total/get-total', authHelper.VerifyToken, TotalCtrl.getTotal);
router.post('/total/set-total', authHelper.VerifyToken, TotalCtrl.setTotal);
router.post('/total/init-total', authHelper.VerifyToken, TotalCtrl.initTotal);

module.exports = router;
