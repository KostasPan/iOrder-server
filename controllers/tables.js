const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Table = require('../models/tableModels');

module.exports = {
  addTable(req, res) {
    console.log(req.body);

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

    // mallon axreiasto:
    // isws na min xreiastei na apothikeyw sti basi ta trapezia
    // (an den ginetai diagrafi trapeziou ws monada)
    // arkei na kserw position kai sunolo
    tablesArray = new Array();
    for (let i = 1; i <= req.body.tablesNumber; i++) {
      tablesArray.push({ id: i, name: req.body.positionName.slice(0, 4) + i });
    }
    console.log(tablesArray);

    const body = {
      position_table: req.body.positionName.slice(0, 4),
      position_table_name: req.body.positionName,
      length_tables: req.body.tablesNumber,
      tables: tablesArray
      // position_table: String,
      // position_table_name: { type: String, default: '' },
      // length_tables: { type: Number, default: 0 },
      // tables: [{ id: { type: Number, min: 0 }, name: { type: String } }]
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
