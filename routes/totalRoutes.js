const express = require('express');
const router = express.Router();

const TotalCtrl = require('../controllers/totals');
const authHelper = require('../helpers/authHelper');

router.post('/total/get-total', authHelper.VerifyToken, TotalCtrl.getTotal);
router.post('/total/set-total', authHelper.VerifyToken, TotalCtrl.setTotal);

module.exports = router;
