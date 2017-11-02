// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var router = express.Router();

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET users listing. */
router.get('/', function(req, res, next) {
  UserModel.find({}, function(err, users) {
    if (err) {
      res.send(err);
    }
    res.send(users);
  });
});

/* POST new user with user data*/
router.post('/', function(req, res) {
  console.log(req.body);
  // res.send(req.body)

  var newUser = new UserModel({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    description: req.body.description,
    school: req.body.school,
    major: req.body.major,
    minor: req.body.minor,
    gpa: req.body.gpa,
    tags: req.body.tags,
    location: req.body.location,
    image: req.body.image
  });

  newUser.save(function(err, user) {
    if (err) {
      res.send(err);
    }

    res.json(user);
  });
});

module.exports = router;
