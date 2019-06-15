const express = require('express');
const router = express.Router();

const ProductCtrl = require('../controllers/products');
const authHelper = require('../helpers/authHelper');

router.get(
  '/products/get-products-categories',
  authHelper.VerifyToken,
  ProductCtrl.getProductsCategories
);
router.get(
  '/products/get-all-products-categ-sorted',
  authHelper.VerifyToken,
  ProductCtrl.getAllProducts
);
router.post(
  '/products/get-products-by-category',
  authHelper.VerifyToken,
  ProductCtrl.getProducts
);
router.post(
  '/products/add-product',
  authHelper.VerifyToken,
  ProductCtrl.addProduct
);
router.post(
  '/products/edit-product',
  authHelper.VerifyToken,
  ProductCtrl.editProduct
);
router.post(
  '/products/delete-product',
  authHelper.VerifyToken,
  ProductCtrl.deleteProduct
);

module.exports = router;
