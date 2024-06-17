"use strict";

// Controlador para o modelo User
var User = require('../models/user');

module.exports.list = function () {
  return User.find().sort('name').then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.getUser = function (id) {
  return User.findById(id).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.getUserByEmail = function (email) {
  return User.findOne({
    email: email
  }).then(function (result) {
    return result;
  })["catch"](function (err) {
    throw err;
  });
};

module.exports.addUser = function (u) {
  return User.create(u).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.updateUser = function (id, info) {
  return User.updateOne({
    _id: id
  }, info).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.updateUserStatus = function (id, status) {
  return User.updateOne({
    _id: id
  }, {
    active: status
  }).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.updateUserPassword = function (id, pwd) {
  return User.updateOne({
    _id: id
  }, pwd).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.deleteUser = function (id) {
  return User.deleteOne({
    _id: id
  }).then(function (resposta) {
    return resposta;
  })["catch"](function (erro) {
    throw erro;
  });
};

module.exports.updateUserLastAccess = function (id) {
  var now = new Date().toISOString().substring(0, 19);
  return User.updateOne({
    _id: id
  }, {
    lastAccess: now
  }).then(function (result) {
    return result;
  })["catch"](function (err) {
    throw err;
  });
};