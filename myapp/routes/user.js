// **************************
// *** GET, PATCH, DELETE ***
// **************************

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  description: String,
  school: String,
  major: String,
  minor: String,
  gpa: String,
  tags: String,
  location: String
});

var UserModel = mongoose.model('user', userSchema);

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET user with ID */
router.get('/:id', function(req, res, next) {
  UserModel.findById(req.params.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.send(user);
  });
});

/* PATCH user with ID */
router.patch('/:id', function(req, res, next) {
  UserModel.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
    if (err) {
      res.send(err);
    }
    // Get user again after updating because 'user' is not updated in local scope
    UserModel.findById(req.params.id, function(err, user) {
      if (err) {
        res.send(err);
      }
      res.send(user);
    });
  });
});

/* DELETE user with ID */
router.delete('/:id', function(req, res, next) {
  UserModel.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.send(user);
  });
});

module.exports = router;
