const express = require('express');
const router = express.Router();

const DiscountCtrl = require('../controllers/discount');
const authHelper = require('../helpers/authHelper');

router.post(
  '/discount/set-discount',
  authHelper.VerifyToken,
  DiscountCtrl.setDiscount
);
router.post(
  '/discount/unset-discount',
  authHelper.VerifyToken,
  DiscountCtrl.unsetDiscount
);

module.exports = router;
