const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Helpers = require('../helpers/helpers');
const Table = require('../models/tableModels');
const User = require('../models/userModels');

module.exports = {
  async addTable(req, res) {
    const schema = Joi.object().keys({
      positionName: Joi.string().required(),
      tablesNumber: Joi.number().integer().min(1).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const table = await Table.findOne({
      position_table_name: Helpers.lowerCase(req.body.positionName),
    });
    if (table) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Position name already exists' });
    }

    tablesArray = new Array();
    for (let i = 1; i <= req.body.tablesNumber; i++) {
      tablesArray.push({
        id: i,
        // name: Helpers.lowerCase(req.body.positionName.slice(0, 4)) + i
      });
    }

    const body = {
      position_table: Helpers.lowerCase(req.body.positionName.slice(0, 4)),
      position_table_name: Helpers.lowerCase(req.body.positionName),
      length_tables: req.body.tablesNumber,
      tables: tablesArray,
    };

    Table.create(body)
      .then((tablesPosition) => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Table position created', tablesPosition });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  deletePositionTable(req, res) {
    const schema = Joi.object().keys({
      positionId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to delete a position table.' });

    Table.deleteOne({ _id: req.body.positionId })
      .then((table) => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Delete position table', table });
      })
      .catch(() => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async editPositionTable(req, res) {
    const schema = Joi.object().keys({
      tableId: Joi.string().required(),
      position_table: Joi.string().required(),
      position_table_name: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to edit tables.' });

    const table = await Table.findOne({
      position_table_name: Helpers.lowerCase(req.body.position_table_name),
      position_table: Helpers.lowerCase(req.body.position_table),
    });
    if (table) {
      console.log(table);
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Position name already exists' });
    }

    const body = {
      position_table: Helpers.lowerCase(req.body.position_table),
      position_table_name: Helpers.lowerCase(req.body.position_table_name),
    };
    Table.updateOne({ _id: req.body.tableId }, { $set: body })
      .then((tables) => {
        res.status(HttpStatus.CREATED).json({
          message: 'Tables customized successfully',
          tables,
        });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured', err });
      });
  },

  async getAllTables(req, res) {
    let promises = [];
    promises.push(Table.find({}));
    promises.push(
      User.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$ordersToGo',
            },
          },
        },
      ])
    );
    await Promise.all(promises)
      .then(([allTables, numOfBusyTables]) => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Tables', allTables, numOfBusyTables });
      })
      .catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      });
  },

  async getBusyTablesOrderTimeSorted(req, res) {
    try {
      const busyTables = await Table.aggregate([
        { $project: { _id: 0, length_tables: 0 } },
        { $unwind: '$tables' },
        {
          $match: {
            'tables.busy': true,
          },
        },
        {
          $sort: {
            'tables.orderTime': 1,
          },
        },
        { $limit: 10 },
      ]);

      return res
        .status(HttpStatus.OK)
        .json({ message: 'Busy tables', busyTables });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },
};
