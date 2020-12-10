const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation error, data is incorrect!');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'User created!', userId: result._is });
    })
    .catch((err) => catchCode(err, next));
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('User couldnt be found!');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('User password dont match!');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        'secret',
        { expiresIn: '1h' }
      );

      res.status(200).json({token: token, userId: loadedUser._id.toString() })
    })
    .catch((err) => catchCode(err, next));
};

const catchCode = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};
