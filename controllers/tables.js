const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Helpers = require('../helpers/helpers');
const Table = require('../models/tableModels');

module.exports = {
  async addTable(req, res) {
    const schema = Joi.object().keys({
      positionName: Joi.string().required(),
      tablesNumber: Joi.number()
        .integer()
        .min(1)
        .required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const table = await Table.findOne({
      position_table_name: Helpers.lowerCase(req.body.positionName)
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
        name: Helpers.lowerCase(req.body.positionName.slice(0, 4)) + i
      });
    }

    const body = {
      position_table: Helpers.lowerCase(req.body.positionName.slice(0, 4)),
      position_table_name: req.body.positionName,
      length_tables: req.body.tablesNumber,
      tables: tablesArray
    };

    Table.create(body)
      .then(tablesPosition => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Table position created', tablesPosition });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  deletePositionTable(req, res) {
    const schema = Joi.object().keys({
      positionId: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to delete a position table.' });

    Table.deleteOne({ _id: req.body.positionId })
      .then(table => {
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

  async getAllTables(req, res) {
    try {
      const allTables = await Table.find({});

      return res
        .status(HttpStatus.OK)
        .json({ message: 'All tables', allTables });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  }
};
