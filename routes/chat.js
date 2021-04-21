const express = require("express");
const router = express.Router();

/* GET /chat  */
router.get("/", function (req, res) {
  res.render("chat");
});

module.exports = router;
