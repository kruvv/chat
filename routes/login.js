const express = require("express");
const router = express.Router();
const User = require("../models/user");
const HttpError = require("../error");
const AuthError = require("../models/user");

/** GET  /login  */
router.get("/", function (req, res) {
  res.render("login");
});

/** POST  /login */
router.post("/", function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User.authorize(username, password, function (err, user) {
    if (err) {
      if (err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }
    //TODO: delete
    // console.log('user:', user);

    req.session.user = user._id;

    res.send({});
  });
});

module.exports = router;
