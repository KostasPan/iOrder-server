const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');
const Order = require('../models/orderModels');
const Table = require('../models/tableModels');

module.exports = {
  async getTotal(req, res) {
    try {
      if (req.user.admin === false)
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'You have to be admin to get totals.' });

      // find those who has total or just unpaid orders without total [online]
      const totals = await User.find(
        { $or: [{ total: { $gt: 0 } }, { total: 0, ordersToGo: { $gt: 0 } }] },
        { total: 1, ordersToGo: 1, username: 1 }
      ).sort({ total: -1, ordersToGo: -1 });
      return res.status(HttpStatus.OK).json({ message: 'Totals', totals });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  initTotal(req, res) {
    const schema = Joi.object().keys({
      userId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to initialize totals.' });

    User.updateOne(
      { _id: req.body.userId, ordersToGo: 0 },
      { $set: { total: 0 } }
    )
      .then((total) => {
        res.status(HttpStatus.OK).json({ message: 'Init Total', total });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },

  setTotal(req, res) {
    const schema = Joi.object().keys({
      total: Joi.number().required(),
      tableId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    Promise.all([
      User.updateOne(
        { username: req.user.username, _id: req.user._id },
        { $inc: { total: req.body.total, ordersToGo: -1 } }
        // { upsert: true }
      ),
      Order.deleteMany({
        tableId: req.body.tableId,
        userId: req.user._id,
      }),
      Table.updateOne(
        { 'tables._id': req.body.tableId },
        {
          $set: {
            'tables.$.busy': false,
            'tables.$.user': '',
            'tables.$.orderTime': null,
          },
        }
      ),
    ])
      .then(([total, order, table]) => {
        res.status(HttpStatus.OK).json({
          message: 'Total placed and order removed',
          total,
          order,
          table,
        });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },

  setPartlyTotal(req, res) {
    const schema = Joi.object().keys({
      p_ids: Joi.array().items(Joi.string().required()).required(),
      total: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    Promise.all([
      User.updateOne(
        { username: req.user.username, _id: req.user._id },
        { $inc: { total: req.body.total } }
      ),
      Order.deleteMany({
        _id: { $in: req.body.p_ids },
        userId: req.user._id,
      }),
    ])
      .then(([total, order]) => {
        res.status(HttpStatus.OK).json({
          message: 'Partly total placed and several orders removed',
          total,
          order,
        });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },
};
