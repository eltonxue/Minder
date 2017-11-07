var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var auth = require('./utils');
var router = express.Router();

// ******************
// *** MIDDLEWARE ***
// ******************

// **************
// *** ROUTES ***
// **************

/* GET authentication page. */
router.get('/', function(req, res, next) {
  res.render('signup-login-page');
});

/* GET session profile page. */
router.get('/self-profile', auth.requireLogin, function(req, res, next) {
  res.render('self-profile', { user: req.session.user });
});

/* GET discovery page. */
router.get('/discovery', function(req, res, next) {
  res.render('discovery');
});

/* GET other user profile page. */
router.get('/user-profile', function(req, res, next) {
  res.render('user-profile');
});

/* GET connect page. */
router.get('/connect', function(req, res, next) {
  res.render('connect');
});

/* GET messages page. */
router.get('/messages', function(req, res, next) {
  res.render('messages');
});

/* LOGGING OUT */
router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;
