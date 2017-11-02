var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var router = express.Router();

// ******************
// *** MIDDLEWARE ***
// ******************

function requireLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
}

router.use(function(req, res, next) {
  if (req.session && req.session.user) {
    UserModel.findOne({ email: req.session.user.email }, function(err, user) {
      if (err) {
        res.send(err);
      }
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user; //refresh the session value
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

// **************
// *** ROUTES ***
// **************

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signup-login-page');
});

/* LOGGING IN */
router.post('/login', function(req, res, next) {
  UserModel.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      res.send(err);
    }
    if (!user) {
      res.send({
        error: 'email',
        code: "<p class='error'>Email does not exist</p>"
      });
    } else {
      if (req.body.password === user.password) {
        console.log('SUCCESSFULLY LOGGED IN');
        // sets a cookie with the user's info
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

router.get('/self-profile', requireLogin, function(req, res, next) {
  UserModel.findById(req.user._id, function(err, user) {
    res.render('self-profile', { user: user });
  });
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

router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;
