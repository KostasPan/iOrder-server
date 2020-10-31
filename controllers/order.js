const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const Helper = require('../helpers/helpers');

const Order = require('../models/orderModels');
const User = require('../models/userModels');
const Table = require('../models/tableModels');

const printer = require('../printer/printer');
// const testprinter = require('../printer/testprinter');

module.exports = {
  async getOrder(req, res) {
    try {
      // check if table busy from another user if not an admin
      const table = await Table.findOne(
        {
          'tables._id': req.body.tableId,
        },
        { 'tables.$': 1, _id: 0 }
      ).then((table) => {
        return table;
      });

      // if (!req.user.admin) {
      if (table.tables[0].busy) {
        if (table.tables[0].user !== req.user.username) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Anauthorized to get table orders',
            auth: null,
          });
        }
      }
      // }

      const order = await Order.find({
        userId: req.user._id,
        tableId: req.body.tableId,
      });
      return res.status(HttpStatus.OK).json({ message: 'Order', order });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  async setOrder(req, res) {
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
                // problematic
                selected: Joi.alternatives().try(
                  Joi.string().required(),
                  Joi.array().items(Joi.string())
                ),
                // selected: Joi.array().items(Joi.string()),
                multiple: Joi.boolean().required(),
              })
            )
            .required(),
          comment: Joi.string().allow(''),
        })
      ),
      tableId: Joi.string().required(),
      table: Joi.string().required(),
      time: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    req.body.products.forEach((p) => {
      p.username = req.user.username;
      p.userId = req.user._id;
      p.tableId = req.body.tableId;
    });

    // find an order with the above body [user, table]
    Order.findOne({
      username: req.user.username,
      userId: req.user._id,
      tableId: req.body.tableId,
    })
      .then((order) => {
        let promises = [];
        promises.push(Order.create(req.body.products));
        if (!order) {
          // order dont exist, init user & table
          promises.push(
            User.updateOne(
              { username: req.user.username, _id: req.user._id },
              {
                $inc: { ordersToGo: 1 },
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
                  'tables.$.user': req.user.username,
                  'tables.$.orderTime': new Date(),
                },
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
          .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
          });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });

    printer.pushElementPrinterStack({
      order: req.body.products,
      table: req.body.table,
      username: req.user.username,
      time: req.body.time,
      type: 'order',
    });
  },

  async moveOrder(req, res) {
    const schema = Joi.object().keys({
      fromtableid: Joi.string().required(),
      totableid: Joi.string().required(),
      selectedorders: Joi.array().items(Joi.string().required()).required(),
      moveall: Joi.boolean().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    // find toTable, fromTable data
    let promises = [];
    promises.push(
      Table.findOne(
        {
          'tables._id': req.body.fromtableid,
        },
        { 'tables.$': 1, _id: 0 }
      )
    );
    promises.push(
      Table.findOne(
        {
          'tables._id': req.body.totableid,
        },
        { 'tables.$': 1, _id: 0 }
      )
    );
    const tables = await Promise.all(promises)
      .then(([fromtable, totable]) => {
        if (!fromtable || !totable) {
          res
            .status(HttpStatus.CONFLICT)
            .json({ message: 'Tables do not exist' });
        } else {
          return { fromtable: fromtable.tables[0], totable: totable.tables[0] };
        }
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });

    // toTable is busy from another user
    if (
      tables.totable.busy === true &&
      tables.totable.user !== req.user.username
    ) {
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ message: "You cannot move orders on other users' table" });
    }

    promises = [];
    if (tables.totable.busy === false) {
      promises.push(
        Table.updateOne(
          { 'tables._id': req.body.totableid },
          {
            $set: {
              'tables.$.busy': true,
              'tables.$.user': req.user.username,
              'tables.$.orderTime': tables.fromtable.orderTime,
            },
          }
        )
      );
    }
    if (req.body.moveall === true) {
      promises.push(
        Table.updateOne(
          { 'tables._id': req.body.fromtableid },
          {
            $set: {
              'tables.$.busy': false,
              'tables.$.user': '',
              'tables.$.orderTime': null,
            },
          }
        )
      );
    }
    if (tables.totable.busy === true && req.body.moveall === true) {
      promises.push(
        User.updateOne(
          { username: req.user.username, _id: req.user._id },
          {
            $inc: { ordersToGo: -1 },
          }
        )
      );
    } else if (tables.totable.busy === false && req.body.moveall === false) {
      promises.push(
        User.updateOne(
          { username: req.user.username, _id: req.user._id },
          {
            $inc: { ordersToGo: 1 },
          }
        )
      );
    }

    promises.push(
      Order.updateMany(
        {
          _id: { $in: req.body.selectedorders },
        },
        {
          $set: { tableId: req.body.totableid },
        }
      )
    );

    await Promise.all(promises)
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'Order moved' });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },

  printComment(req, res) {
    const schema = Joi.object().keys({
      comment: Joi.string().required(),
      time: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }
    printer.pushElementPrinterStack({
      comment: req.body.comment,
      username: req.user.username,
      time: req.body.time,
      type: 'comment',
    });
    return res.status(HttpStatus.OK).json({ message: 'Comment received' });
  },
};
