// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var userSchema = mongoose.Schema({
  name: String,
  email: String
});

var UserModel = mongoose.model('users', userSchema);

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET users listing. */
router.get('/', function(req, res, next) {
  UserModel.find({}, function(err, users) {
    if (err) {
      console.log(err);
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
    email: req.body.email
  });

  newUser.save(function(err, user) {
    if (err) {
      res.send(err);
    }

    res.json(user);
  });
});

module.exports = router;
