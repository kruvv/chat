var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET /users  */
router.get('/', function(req, res, next) {
  console.log('req', req._parsedOriginalUrl.path);
  User.find({}, function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
});


module.exports = router;
