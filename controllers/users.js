const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const Helpers = require('../helpers/helpers');

const User = require('../models/userModels');

module.exports = {
  async getUsers(req, res) {
    try {
      if (req.user.admin === false)
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'You have to be admin to get users list.' });

      const users = await User.find({}, { password: 0 }).sort({
        total: 1,
        ordersToGo: 1
      });
      return res.status(HttpStatus.OK).json({ message: 'Users', users });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    }
  },

  deleteUser(req, res) {
    const schema = Joi.object().keys({
      userId: Joi.string().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to delete a user.' });

    User.deleteOne({ _id: req.body.userId })
      .then(user => {
        res.status(HttpStatus.OK).json({ message: 'User deletion', user });
      })
      .catch(() => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async setUser(req, res) {
    const schema = Joi.object().keys({
      userId: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      admin: Joi.boolean().required()
    });
    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    if (req.user.admin === false)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'You have to be admin to edit user.' });

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Error hashing password' });
      }

      const body = {
        username: Helpers.lowerCase(value.username),
        password: hash,
        admin: value.admin
      };
      User.updateOne({ _id: req.body.userId }, { $set: body })
        .then(user => {
          res.status(HttpStatus.CREATED).json({
            message: 'User customized successfully',
            user
          });
        })
        .catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error occured', err });
        });
    });
  }
};
