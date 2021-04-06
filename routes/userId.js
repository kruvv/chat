var express = require('express');
const HttpError = require('../error');
var router = express.Router();

var User = require('../models/user');

/* GET /user/:id */
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err);
    if (!user) {
      next(new HttpError(404, 'User not found!!!'))
    }
    res.json(user);
  });
});

module.exports = router;
