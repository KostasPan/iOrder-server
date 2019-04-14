const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Product = require('../models/productModels');

module.exports = {
  async getProductsCategories(req, res) {
    try {
      const categories = await Product.distinct('category');
      return res
        .status(HttpStatus.OK)
        .json({ message: 'All Products Categories', categories });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  async getProducts(req, res) {
    console.log(req.body);
    try {
      const products = await Product.find({ category: req.body.category });
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Products by Category', products });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  }
};
