const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Total = require('../models/totalModels');
const Helpers = require('../helpers/helpers');
const dbConfig = require('../config/secret');

module.exports = {
  async loginUser(req, res) {
    console.log(req.body);

    if (!req.body.username || !req.body.password) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No empty fields allowed' });
    }

    await User.findOne({
      username: Helpers.lowerCase(req.body.username)
    })
      .then(user => {
        if (!user) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Username not found' });
        }

        return bcrypt.compare(req.body.password, user.password).then(result => {
          if (!result) {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Password is incorrect' });
          }
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: '8h'
          });
          // cookie for browser
          res.cookie('auth', token);
          return res
            .status(HttpStatus.OK)
            .json({ message: 'Login successful', user, token });
        });
      })
      .catch(err => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },

  async createUser(req, res) {
    console.log(req.body);
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
      admin: Joi.boolean()
      //TODO: o diaxeiristis toy systimatos kanei thn eggrafi neou servitorou
      //      opote ta pedia pros symplirosi pou tha xreiastoun einai:
      //      { [username, password, onoma, eponimo, tilefwno] }
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
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

      // TODO: kata tin dimiourgia xristi na dimiourgei pedio totals!
      // Promise.all([
      //   User.create({
      //     username: Helpers.lowerCase(value.username),
      //     password: hash,
      //     admin: value.admin
      //   }),
      //   Total.create({
      //     username: value.username,
      //     userId:
      //   })
      // ]).then(([user, total]) => {
      //   res
      //     .status(HttpStatus.CREATED)
      //     .json({ message: 'User created, Total created successfully', user, total })}
      // ).catch(err => {
      //   res
      //     .status(HttpStatus.INTERNAL_SERVER_ERROR)
      //     .json({ message: 'Error occured', err });
      // });

      const body = {
        username: Helpers.lowerCase(value.username),
        password: hash,
        admin: value.admin
      };
      User.create(body)
        .then(user => {
          // const token = jwt.sign({ data: user }, dbConfig.secret, {
          //   expiresIn: '6h'
          // });
          // // cookie for browser
          // res.cookie('auth', token);

          // Total.create({
          //   username: value.username,
          //   userId: user._id
          // })
          //   .then(total => {
          //     res.status(HttpStatus.CREATED).json({
          //       message: 'User created - Total created successfully',
          //       user,
          //       total
          //     });
          //   })
          //   .catch(err => {
          //     res
          //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
          //       .json({ message: 'Error occured', err });
          //   });

          res.status(HttpStatus.CREATED).json({
            message: 'User created successfully',
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
