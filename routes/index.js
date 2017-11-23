var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('../schemas/user');
var auth = require('../utils/utils');
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

router.use(auth.requireLogin);

/* GET session profile page. */
router.get('/self-profile', function(req, res, next) {
  res.render('self-profile', { user: req.session.user });
});

/* GET discovery page. */
router.get('/discovery', function(req, res, next) {
  res.render('discovery');
});

/* GET other user profile page. */
router.get('/profile-:id', function(req, res, next) {
  UserModel.findById(req.params.id, function(err, user) {
    if (err) {
      return res.send(err);
    }
    UserModel.find({})
      .then(function(users) {
        let connections = [];
        for (let i = 0; i < users.length; ++i) {
          let index = user.connections.indexOf(users[i]._id);
          if (index > -1) {
            connections.push(users[i]);
          }
        }
        res.render('user-profile', {
          otherUser: user,
          connections: connections
        });
      })
      .catch(function(err) {
        return res.send(err);
      });
  });
});

/* GET connect page. */
router.get('/connect-:id', function(req, res, next) {
  res.render('connect', { user: req.session.user, connectid: req.params.id });
});

/* GET messages page. */
router.get('/messages', function(req, res, next) {
  res.render('messages');
});

/* GET connections page. */
router.get('/connections', function(req, res, next) {
  res.render('connections', { user: req.session.user });
});

/* LOGGING OUT */
router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;
