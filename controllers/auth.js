const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Helpers = require('../helpers/helpers');
const dbConfig = require('../config/secret');

module.exports = {
  loginUser(req, res) {
    console.log(req.body);
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ msg: error.details });
    }
  },

  async createUser(req, res) {
    console.log(req.body);
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required()
      //TODO: o diaxeiristis toy systimatos kanei thn eggrafi neou servitorou
      //      opote ta pedia pros symplirosi pou tha xreiastoun einai:
      //      { [username, password, onoma, eponimo, tilefwno] }
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ msg: error.details });
    }

    const uname = await User.findOne({
      username: Helpers.lowerCase(req.body.username)
    });
    if (uname) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Username already exists' });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Error hashing password' });
      }
      const body = {
        username: Helpers.lowerCase(value.username),
        password: hash
      };
      User.create(body)
        .then(user => {
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: '6h'
          });
          res.cookie('auth', token);
          res
            .status(HttpStatus.CREATED)
            .json({ message: 'User created successfully', user, token });
        })
        .catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error occured', err });
        });
    });
  }
};
