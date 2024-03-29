// **************************
// *** GET, PATCH, DELETE ***
// **************************

var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('../schemas/user');
var fs = require('fs');
var router = express.Router();

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

// GETS CURRENT SESSION USER
router.get('/', function(req, res, next) {
  UserModel.findById(req.session.user.id)
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// GET SESSION USER'S CONNECTIONS
router.get('/connections', function(req, res, next) {
  UserModel.find({})
    .then(function(users) {
      let connections = {
        userConnections: [],
        pendingRequests: [],
        pendingInvites: []
      };

      for (let i = 0; i < users.length; ++i) {
        let index = req.session.user.connections.indexOf(users[i]._id);
        if (index > -1) {
          connections.userConnections.push(users[i]);
        }
        index = req.session.user.pendingRequests.indexOf(users[i]._id);
        if (index > -1) {
          connections.pendingRequests.push(users[i]);
        }
        index = req.session.user.pendingInvites.indexOf(users[i]._id);
        if (index > -1) {
          connections.pendingInvites.push(users[i]);
        }
      }

      res.json(connections);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// GET USER BY ID
router.get('/:id', function(req, res, next) {
  UserModel.findById(req.params.id)
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// PATCH SESSION USER WITH PASSED DATA
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

  if (data.location) {
    data.location.geo.coordinates[0] = parseFloat(
      data.location.geo.coordinates[0]
    );
    data.location.geo.coordinates[1] = parseFloat(
      data.location.geo.coordinates[1]
    );
  }

  UserModel.findByIdAndUpdate(req.session.user.id, data, { new: true })
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// PATCH SPECIFIED USER (with given ID)
router.patch('/:id', function(req, res, next) {
  var data = req.body;
  if (req.body.image) {
    var buffer = new Buffer(req.body.image, 'base64');
    delete data.image;
    fs.writeFileSync(
      `${__dirname}/../public/images/profile/${req.params.id}.png`,
      buffer
    );

    data.image = `/images/profile/${req.params.id}.png`;
  }

  if (data.location) {
    data.location.geo.coordinates[0] = parseFloat(
      data.location.geo.coordinates[0]
    );
    data.location.geo.coordinates[1] = parseFloat(
      data.location.geo.coordinates[1]
    );
  }

  UserModel.findByIdAndUpdate(req.params.id, data, { new: true })
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// DELETE SESSION USER FROM USER DATABASE
router.delete('/', function(req, res, next) {
  UserModel.findByIdAndRemove(req.session.user.id, function(err, user) {
    if (err) {
      return res.send(err);
    }
    res.send(user);
  });
});

// DELETE SPECIFIED USER (with given ID) FROM USER DATABASE
router.delete('/:id', function(req, res, next) {
  UserModel.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) {
      return res.send(err);
    }
    res.send(user);
  });
});

module.exports = router;
