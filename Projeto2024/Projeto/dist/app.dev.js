"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var mongoose = require('mongoose');

var session = require('express-session');

var FileStore = require('session-file-store')(session);

var bodyParser = require('body-parser');

var _require = require('uuid'),
    uuidv4 = _require.v4;

var mongoDB = 'mongodb://127.0.0.1:27017/EWPROJETO';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB'));
db.once('open', function () {
  console.log("Conexão ao MongoDB realizada com sucesso");
});

var usersRouter = require('./routes/users');

var ucsRouter = require('./routes/ucs');

var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(session({
  genid: function genid(req) {
    console.log("Nova sess\xE3o iniciada: ".concat(req.sessionID));
    return uuidv4();
  },
  store: new FileStore(),
  secret: 'EngWeb2024',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.json({
  limit: '100mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'public')));
app.use('/users', usersRouter);
app.use('/', ucsRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;