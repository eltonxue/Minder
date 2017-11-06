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

/* LOGGING IN */
router.post('/login', function(req, res, next) {
  UserModel.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      res.send(err);
    }

    // let check = user.checkPassword(req.body.password);

    if (!user) {
      res.send({
        error: 'email',
        code: "<p class='error'>Email does not exist</p>"
      });
    } else {
      if (req.body.password === user.password) {
        console.log('SUCCESSFULLY LOGGED IN');
        // Sets a cookie with the user's info
        req.session.user = user;
        res.send({ redirect: '/self-profile' });
      } else {
        res.send({
          error: 'password',
          code: "<p class='error'>Incorrect Password</p>"
        });
      }
    }
  });
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
