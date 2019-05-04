const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Order = require('../models/orderModels');

module.exports = {
  async getOrder(req, res) {
    try {
      const body = {};
      if (!req.user.admin) {
        body.userId = req.user._id;
      }
      body.tableId = req.body.tableId;
      console.log(body);
      const order = await Order.find(body);
      return res.status(HttpStatus.OK).json({ message: 'Order', order });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  setOrder(req, res) {
    console.log('setOrder');
    const schema = Joi.object().keys({
      products: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().required(),
          quantity: Joi.number().required(),
          choices: Joi.array()
            .items(
              Joi.object({
                type: Joi.string().required(),
                selected: Joi.alternatives([
                  Joi.string().required(),
                  Joi.array()
                ]),
                multiple: Joi.boolean().required()
              })
            )
            .required(),
          comment: Joi.string().allow('')
        })
      ),
      tableId: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    req.body.products.forEach(p => {
      p.username = req.user.username;
      p.userId = req.user._id;
      p.tableId = req.body.tableId;
    });

    const body = req.body.products;

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
