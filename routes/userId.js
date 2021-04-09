const express = require('express');
const HttpError = require('../error');
const router = express.Router();
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;

/* GET /user/:id */
router.get('/:id', function(req, res, next) {

  // Create a new ObjectID
  let objectId;
  try {
     objectId = new ObjectID(req.params.id);
  } catch (error) {
    return next(404);
  }

  User.findById(objectId, function(err, user) {
    if (err) return next(err);
    if (!user) {
      next(new HttpError(404, 'User not found!!!'))
    }
    res.json(user);
  });
});

module.exports = router;
