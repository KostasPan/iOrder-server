const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Total = require('../models/totalModels');
// const OrderRemove = require('../models/orderRemoveModels');
const Order = require('../models/orderModels');

module.exports = {
  async getTotal(req, res) {
    try {
      console.log('getTotals');
      const totals = await Total.find({});
      return res.status(HttpStatus.OK).json({ message: 'Totals', totals });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  setTotal(req, res) {
    console.log('setTotal');
    const schema = Joi.object().keys({
      total: Joi.number().required(),
      tableId: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    // update Total
    Total.updateOne(
      { username: req.user.username, userId: req.user._id },
      { $inc: { total: req.body.total } },
      { upsert: true }
    )
      .then(total => {
        // remove Order
        Order.remove({
          tableId: req.body.tableId,
          userId: req.user._id
        })
          .then(order => {
            res.status(HttpStatus.OK).json({
              message: 'Total placed and order removed',
              total,
              order
            });
          })
          .catch(err => {
            res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Error order remove' }, { error: err });
          });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error total' }, { error: err });
      });
  }
};
