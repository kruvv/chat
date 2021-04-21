const User = require("../models/user");

module.exports = function (req, res, next) {
  req.user = res.locals.user = null;

  if (!req.session.user) return next();

  User.findById(req.session.user, function (err, user) {
    if (err) next(err);

    req.user = res.locals.user = user;
    next();
  });
};
