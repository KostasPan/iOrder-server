const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Table = require('../models/tableModels');

module.exports = {
  async setDiscount(req, res) {
    const schema = Joi.object().keys({
      discount: Joi.object({
        isDiscountActive: Joi.boolean().required(),
        discountedtotal: Joi.alternatives([
          Joi.number().required(),
          Joi.string().required()
        ]),
        total: Joi.number().required(),
        discount: Joi.number().required(),
        type: Joi.string().required(),
        discountStr: Joi.string().required()
      }),
      tableid: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to give a discount.' });

    // set discount to table
    await Table.updateOne(
      {
        'tables._id': req.body.tableid
      },
      {
        $set: { 'tables.$.discount': req.body.discount }
      }
    )
      .then(discount => {
        res.status(HttpStatus.OK).json({ message: 'Discount', discount });
      })
      .catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },

  async unsetDiscount(req, res) {
    const schema = Joi.object().keys({
      tableid: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to unset a discount.' });

    // set discount to table
    await Table.updateOne(
      {
        'tables._id': req.body.tableid
      },
      {
        $unset: { 'tables.$.discount': {} }
      }
    )
      .then(discount => {
        res.status(HttpStatus.OK).json({ message: 'Unset Discount', discount });
      })
      .catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  }
};
