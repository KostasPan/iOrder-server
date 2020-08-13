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
  },

  async getAllProducts(req, res) {
    try {
      const products = await Product.find({}).sort({ category: 1 });
      return res
        .status(HttpStatus.OK)
        .json({ message: 'All Products sorted by Category', products });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  deleteProduct(req, res) {
    const schema = Joi.object().keys({
      _id: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to delete a product.' });

    Product.deleteOne({ _id: req.body._id })
      .then((product) => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Successfully deletion of product', product });
      })
      .catch(() => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async addProduct(req, res) {
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      price: Joi.number().required(),
      category: Joi.string().required(),
      details: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().required(),
            choices: Joi.array(),
            multiple: Joi.boolean().required(),
          })
        )
        .required(),
      detailsoptional: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().required(),
            choices: Joi.array(),
            multiple: Joi.boolean().required(),
          })
        )
        .required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to add products.' });

    const prod = await Product.findOne({
      name: req.body.name,
    });
    if (prod) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Product name already exists' });
    }

    const body = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      details: req.body.details,
      detailsoptional: req.body.detailsoptional,
    };

    Product.create(body)
      .then((product) => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Product added successfully', product });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async editProduct(req, res) {
    const schema = Joi.object().keys({
      _id: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().required(),
      category: Joi.string().required(),
      details: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().required(),
            choices: Joi.array(),
            multiple: Joi.boolean().required(),
          })
        )
        .required(),
      detailsoptional: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().required(),
            choices: Joi.array(),
            multiple: Joi.boolean().required(),
          })
        )
        .required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to edit products.' });

    const body = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      details: req.body.details,
      detailsoptional: req.body.detailsoptional,
    };
    Product.updateOne({ _id: req.body._id }, { $set: body })
      .then((product) => {
        res.status(HttpStatus.CREATED).json({
          message: 'Product customized successfully',
          product,
        });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured', err });
      });
  },
};
