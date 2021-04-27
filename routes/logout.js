const express = require("express");
const router = express.Router();

/* POST /logout  */
router.post("/", function (req, res, next) {
  const sid = req.session.id;
  const io = req.app.get("io");

  req.session.destroy(function (err) {
    try {
      io.sockets.emit("session:reload", sid);
    } catch (error) {
      return next(error);
    }
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
