"use strict";

var axios = require('axios');

var env = require('../config/env');

var jwt = require('jsonwebtoken');

module.exports.verificaAutenticacao = function (req, res, next) {
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, "EngWeb2024", function (e, payload) {
      if (e) {
        // ocorreu um erro
        console.log("Aqui");
        res.redirect('/login');
      } else {
        req.idUser = payload._id;
        req.typeUser = payload.level;
        req.ucs = payload.ucs;
        req.email = payload.email;
        next();
      }
    });
  } else {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  }
};

module.exports.verificaAdmin = function (req, res, next) {
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, "EngWeb2024", function (e, payload) {
      if (e) {
        // ocorreu um erro
        console.log("AAAAAAAAAAAAAAAAAAA");
        res.redirect('/login');
      } else {
        req.idUser = payload._id;
        req.typeUser = payload.level;
        req.email = payload.email;
        if (req.typeUser == "admin") next();else res.redirect('/login');
      }
    });
  } else {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  }
};

module.exports.verificaAdminOUProdutor = function (req, res, next) {
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, "EngWeb2024", function (e, payload) {
      if (e) {
        // ocorreu um erro
        res.redirect('/login');
      } else {
        req.idUser = payload._id;
        req.typeUser = payload.level;
        req.email = payload.email;
        if (req.typeUser == "admin" || req.typeUser == "prod") next();else res.redirect('/login');
      }
    });
  } else {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  }
};

module.exports.login = function (loginData) {
  return axios.post(env.authRoute('/login'), loginData).then(function (result) {
    return result; // token do authserver
  })["catch"](function (err) {
    throw err;
  });
};

module.exports.register = function (signupData, token) {
  return axios.post(env.authRoute("/register?token=".concat(token)), signupData).then(function (result) {
    return result;
  })["catch"](function (err) {
    throw err;
  });
};

module.exports.registerAdmin = function (signupData, token) {
  return axios.post(env.authRoute("/registerAdmin?token=".concat(token)), signupData).then(function (result) {
    return result;
  })["catch"](function (err) {
    console.log(JSON.stringify(err));
    throw err;
  });
};

module.exports.registerDocente = function (signupData, token) {
  return axios.post(env.authRoute("/registerDocente?token=".concat(token)), signupData).then(function (result) {
    return result;
  })["catch"](function (err) {
    console.log(JSON.stringify(err));
    throw err;
  });
};

module.exports.getUser = function (userID, token) {
  return axios.get(env.authRoute("/".concat(userID, "?token=").concat(token))).then(function (result) {
    return result;
  })["catch"](function (err) {
    throw err;
  });
};

module.exports.updateUser = function (userID, userData, token) {
  return axios.put(env.authRoute("/".concat(userID, "?token=").concat(token)), userData).then(function (result) {
    return result;
  })["catch"](function (err) {
    throw err;
  });
};