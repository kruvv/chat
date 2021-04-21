const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

/* GET /chat  */
router.get("/", checkAuth, function (req, res) {
  res.render("chat");
});

module.exports = router;
