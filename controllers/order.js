const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Order = require('../models/orderModels');
const User = require('../models/userModels');
const Table = require('../models/tableModels');

module.exports = {
  async getOrder(req, res) {
    try {
      // check if table busy from another user if not an admin
      const table = await Table.findOne(
        {
          'tables._id': req.body.tableId
        },
        { 'tables.$': 1, _id: 0 }
      ).then(table => {
        return table;
      });

      // if (!req.user.admin) {
      if (table.tables[0].busy) {
        if (table.tables[0].user !== req.user.username) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Anauthorized to get table orders',
            auth: null
          });
        }
      }
      // }

      const order = await Order.find({
        userId: req.user._id,
        tableId: req.body.tableId
      });
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

    // find an order with the above body [user, table]
    Order.findOne({
      username: req.user.username,
      userId: req.user._id,
      tableId: req.body.tableId
    })
      .then(order => {
        let promises = [];
        promises.push(Order.create(req.body.products));
        if (!order) {
          // order dont exist, init user & table
          promises.push(
            User.updateOne(
              { username: req.user.username, _id: req.user._id },
              {
                $inc: { ordersToGo: 1 }
              }
              // { upsert: true, new: true }
            )
          );
          promises.push(
            Table.updateOne(
              { 'tables._id': req.body.tableId },
              {
                $set: {
                  'tables.$.busy': true,
                  'tables.$.user': req.user.username
                }
              }
            )
          );
        }
        Promise.all(promises)
          .then(([order, total, table]) => {
            res
              .status(HttpStatus.OK)
              .json({ message: 'Order created', order, total, table });
          })
          .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
          });
      })
      .catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  }
};
