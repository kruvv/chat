const express = require('express');
const router = express.Router();
const User = require('../models/user');

/* GET /users  */
router.get('/', function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

module.exports = router;
