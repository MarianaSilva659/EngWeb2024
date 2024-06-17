"use strict";

var mongoose = require('mongoose');

var User = require("../models/users");

module.exports.list = function () {
  return User.find().sort({
    _id: 1
  }).exec();
}; //vai buscar as ucvs que um user tem adquiridas


module.exports.listUcsByEmail = function (email) {
  return User.findOne({
    email: email
  }).select('ucs') // Seleciona apenas o campo 'ucs'
  .exec().then(function (user) {
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.ucs; // Retorna apenas o campo 'ucs'
  })["catch"](function (err) {
    throw err; // Rejeita a promessa com o erro ocorrido
  });
};

module.exports.findUserByEmail = function (email) {
  return User.findOne({
    email: email
  }).exec().then(function (user) {
    if (!user) {
      throw Promise.reject(new Error('Usuário não encontrado'));
    }

    return user;
  })["catch"](function (err) {
    throw err;
  });
};

module.exports.findUsersByLevel = function (level) {
  return User.find({
    level: level
  }).exec().then(function (users) {
    if (!users || users.length === 0) {
      throw new Error('Nenhum usuário encontrado com o nível especificado');
    }

    return users;
  })["catch"](function (err) {
    throw err;
  });
};