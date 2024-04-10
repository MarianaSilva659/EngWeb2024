var express = require("express");
var router = express.Router();
var Pessoa = require("../controllers/pessoas");

router.get("/", function (req, res, next) {
  Pessoa.list()
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

router.get("/:id", function (req, res, next) {
  Pessoa.findById(req.params.id)
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

router.post("/", function (req, res, next) {
  Pessoa.insert(req.body)
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

router.put("/:id", function (req, res, next) {
  Pessoa.update(req.params.id, req.body)
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

router.delete("/:id", function (req, res, next) {
  Pessoa.remove(req.params.id)
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

module.exports = router;
