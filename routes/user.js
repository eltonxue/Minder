// **************************
// *** GET, PATCH, DELETE ***
// **************************

var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var fs = require('fs');
var router = express.Router();

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET user with ID */
router.get('/', function(req, res, next) {
  UserModel.findById(req.session.user.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.send(user);
  });
});

/* PATCH user with ID */
router.patch('/', function(req, res, next) {
  var data = req.body;
  if (req.body.image) {
    var buffer = new Buffer(req.body.image, 'base64');
    delete data.image;
    fs.writeFileSync(
      `${__dirname}/../public/images/profile/${req.session.user.id}.png`,
      buffer
    );

    data.image = `/images/profile/${req.session.user.id}.png`;
  }

  UserModel.findByIdAndUpdate(
    req.session.user.id,
    data,
    { new: true },
    function(err, user) {
      if (err) {
        return res.send(err);
      }

      res.json(user);
    }
  );
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
