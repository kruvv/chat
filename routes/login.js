const express = require('express');
const router = express.Router();
const User = require('../models/user');
const async = require('async');
const HttpError = require('../error');


/** GET  /login  */
router.get('/', function(req, res) {
  res.render('login');
});

/** POST  /login */
router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  async.waterfall([
    function(callback) {
      User.findOne({username: username}, callback);
    },
    function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          // ...200 OK
          callback(null, user);
        } else {
          // ...403 Forbidden
          next(new HttpError(403, "Пароль неверный"));
        }
      } else {
        const user = new User({username: username, password: password});
        user.save(function(err) {
          if (err) return next(err);
          // ...200 OK
          callback(null, user);
        });
      }
    }
  ], function(err) {
    if(err) return next(err);
    req.session.user = user._id;
    res.send({});
  });
});

module.exports = router;
