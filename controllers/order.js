const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Order = require('../models/orderModels');

module.exports = {
  getOrder(req, res) {
    console.log(req);
  },

  setOrder(req, res) {
    console.log(req.body);

    const schema = Joi.object().keys({
      // TODO: na ftiaksw to schema basi to orderModel.js
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const body = {
      // TODO: na ftiaksw to body gia tin basi
      
      // table: req.body.table,
      // user: req.user.username
      // price: req.body.tablesNumber,
      // products: req.body.yolo
    };

    Order.create(body)
      .then(order => {
        res.status(HttpStatus.OK).json({ message: 'Order created', order });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' }, { error: err });
      });
  }
};
