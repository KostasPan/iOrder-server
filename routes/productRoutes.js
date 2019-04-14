const express = require('express');
const router = express.Router();

const ProductCtrl = require('../controllers/products');
const authHelper = require('../helpers/authHelper');

router.get(
  '/products/get-products-categories',
  authHelper.VerifyToken,
  ProductCtrl.getProductsCategories
);
router.post(
  '/products/get-products-by-category',
  authHelper.VerifyToken,
  ProductCtrl.getProducts
);

module.exports = router;
