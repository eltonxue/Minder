// **************************
// *** GET, PATCH, DELETE ***
// **************************

var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./user-model');
var fs = require('fs');
var router = express.Router();

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET user with session user */
router.get('/', function(req, res, next) {
  UserModel.findById(req.session.user.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
});

// GET SESSION USER CONNECTIONS
router.get('/connections', function(req, res, next) {
  UserModel.findById(req.session.user.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    UserModel.find({})
      .then(function(users) {
        let connections = {
          userConnections: [],
          pendingRequests: [],
          pendingInvites: []
        };
        for (let i = 0; i < users.length; ++i) {
          let index = user.connections.indexOf(users[i]._id);
          if (index > -1) {
            connections.userConnections.push(users[i]);
          }
          index = user.pendingRequests.indexOf(users[i]._id);
          if (index > -1) {
            connections.pendingRequests.push(users[i]);
          }
          index = user.pendingInvites.indexOf(users[i]._id);
          if (index > -1) {
            connections.pendingInvites.push(users[i]);
          }
        }

        res.json(connections);
      })
      .catch(function(err) {
        res.send(err);
      });
  });
});

/* GET user with :id */
router.get('/:id', function(req, res, next) {
  UserModel.findById(req.params.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
});

/* PATCH user with session user */
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

/* PATCH user with id user */
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

  UserModel.findByIdAndUpdate(req.params.id, data, { new: true }, function(
    err,
    user
  ) {
    if (err) {
      return res.send(err);
    }

    res.json(user);
  });
});

/* DELETE session user from database */
router.delete('/', function(req, res, next) {
  UserModel.findByIdAndRemove(req.session.user.id, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.send(user);
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
