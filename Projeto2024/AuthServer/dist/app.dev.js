"use strict";

var createError = require('http-errors');

var express = require('express');

var logger = require('morgan');

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var session = require('express-session'); // Adicionando o express-session


var mongoose = require('mongoose');

var mongodb = 'mongodb://127.0.0.1:27017/EWPROJETO';
mongoose.connect(mongodb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function () {
  console.log("Conexão ao MongoDB realizada com sucesso...");
}); // passport config

var User = require('./models/user');

passport.use(new LocalStrategy({
  usernameField: 'email'
}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var usersRouter = require('./routes/user');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(session({
  secret: 'EngWeb2024',
  // Chave secreta para assinar a sessão
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/users', usersRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.stack);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.jsonp({
    error: err
  });
});
module.exports = app;