var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    title: "Express",
    version: "0.0.1",
  });
});

module.exports = router;
