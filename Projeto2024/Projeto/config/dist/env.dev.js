"use strict";

var _this = void 0;

// Servidor de autenticação
module.exports.authAccessPoint = process.env.AUTH || 'http://localhost:3001/users';

module.exports.authRoute = function (route) {
  return _this.authAccessPoint + route;
};