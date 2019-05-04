const express = require('express');
const router = express.Router();

const OrderCtrl = require('../controllers/order');
const authHelper = require('../helpers/authHelper');

router.post('/order/get-order', authHelper.VerifyToken, OrderCtrl.getOrder);
router.post('/order/set-order', authHelper.VerifyToken, OrderCtrl.setOrder);

module.exports = router;
