const express = require("express");
const router = express.Router();

/* POST /logout  */
router.post("/", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
