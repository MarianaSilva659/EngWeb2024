var express = require("express");
var router = express.Router();
var Pessoa = require("../controllers/pessoas");

router.get("/", function (req, res, next) {
  Pessoa.listModalidades()
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

router.get("/:modalidade", function (req, res, next) {
  Pessoa.listPessoasByModalidade(req.params.modalidade)
    .then((dados) => res.jsonp(dados))
    .catch((error) =>
      res.status(500).jsonp({ error: "There was an error with the server" }),
    );
});

module.exports = router;
