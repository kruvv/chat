const crypto = require("crypto");
const { Schema, model } = require("mongoose");
const async = require("async");
const AuthError = require("../error/index");

let schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

schema.methods.encryptPassword = function (password) {
  return crypto.createHmac("sha1", this.salt).update(password).digest("hex");
};

schema
  .virtual("password")
  .set(function (password) {
    this._plainPassword = password;
    this.salt = Math.random() + "";
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._plainPassword;
  });

schema.methods.checkPassword = function (password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function (username, password, callback) {
  const User = this;

  async.waterfall(
    [
      function (callback) {
        User.findOne({ username: username }, callback);
      },
      function (user, callback) {
        if (user) {
          if (user.checkPassword(password)) {
            // ...200 OK
            callback(null, user);
          } else {
            // ...403 Forbidden
            callback(new AuthError("Пароль неверный"));
          }
        } else {
          let user = new User({ username: username, password: password });
          user.save(function (err) {
            if (err) return callback(err);
            // ...200 OK
            callback(null, user);
          });
        }
      },
    ],
    callback
  );
};

module.exports = model("User", schema);
