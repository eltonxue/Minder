var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('signup-login-page');
});

router.get('/self-profile', function(req, res, next) {
  res.render('self-profile');
});

router.get('/discovery', function(req, res, next) {
  res.render('discovery');
});

router.get('/user-profile', function(req, res, next) {
  res.render('user-profile');
});

router.get('/connect', function(req, res, next) {
  res.render('connect');
});

router.get('/messages', function(req, res, next) {
  res.render('messages');
});

module.exports = router;
