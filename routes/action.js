var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./user-model');
var router = express.Router();

router.patch('/remove', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  let sessionConnections = sessionUser.connections;
  sessionConnections.splice(sessionConnections.indexOf(otherUserID), 1);

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    { connections: sessionConnections },
    function(err, user) {
      if (err) {
        res.send(err);
      }
      UserModel.findById(otherUserID, function(err, otherUser) {
        if (err) {
          res.send(err);
        }
        let otherConnections = otherUser.connections;
        otherConnections.splice(otherConnections.indexOf(sessionUser.id), 1);

        UserModel.findByIdAndUpdate(
          otherUserID,
          { connections: otherConnections },
          { new: true },
          function(err, updatedUser) {
            if (err) {
              res.send(err);
            }
            res.json(updatedUser);
          }
        );
      });
    }
  );
});

router.patch('/accept', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;
  console.log(req.body);

  let sessionConnections = sessionUser.connections;
  sessionConnections.push(otherUserID);

  let newPendingRequests = sessionUser.pendingRequests;
  newPendingRequests.splice(newPendingRequests.indexOf(otherUserID), 1);

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    { connections: sessionConnections, pendingRequests: newPendingRequests },
    function(err, user) {
      if (err) {
        res.send(err);
      }

      console.log('error one passed');

      UserModel.findById(otherUserID, function(err, otherUser) {
        if (err) {
          res.send(err);
        }
        let otherConnections = otherUser.connections;
        otherConnections.push(sessionUser.id);

        let newPendingInvites = otherUser.pendingInvites;
        newPendingInvites.splice(newPendingInvites.indexOf(sessionUser.id), 1);

        UserModel.findByIdAndUpdate(
          otherUserID,
          { connections: otherConnections, pendingInvites: newPendingInvites },
          { new: true },
          function(err, updatedUser) {
            if (err) {
              res.send(err);
            }
            res.json(updatedUser);
          }
        );
      });
    }
  );
});

router.patch('/deny', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  let newPendingRequests = sessionUser.pendingRequests;
  newPendingRequests.splice(newPendingRequests.indexOf(otherUserID), 1);

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    { pendingRequests: newPendingRequests },
    function(err, user) {
      if (err) {
        res.send(err);
      }
      UserModel.findById(otherUserID, function(err, otherUser) {
        if (err) {
          res.send(err);
        }

        let newPendingInvites = otherUser.pendingInvites;
        newPendingInvites.splice(newPendingInvites.indexOf(sessionUser.id), 1);

        UserModel.findByIdAndUpdate(
          otherUserID,
          { pendingInvites: newPendingInvites },
          { new: true },
          function(err, updatedUser) {
            if (err) {
              res.send(err);
            }
            res.json(updatedUser);
          }
        );
      });
    }
  );
});

router.patch('/cancel', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  let newPendingInvites = sessionUser.pendingInvites;
  newPendingInvites.splice(newPendingInvites.indexOf(otherUserID), 1);

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    { pendingInvites: newPendingInvites },
    function(err, user) {
      if (err) {
        res.send(err);
      }
      UserModel.findById(otherUserID, function(err, otherUser) {
        if (err) {
          res.send(err);
        }

        let newPendingRequests = otherUser.pendingRequests;
        newPendingRequests.splice(
          newPendingRequests.indexOf(sessionUser.id),
          1
        );

        UserModel.findByIdAndUpdate(
          otherUserID,
          { pendingRequests: newPendingRequests },
          { new: true },
          function(err, updatedUser) {
            if (err) {
              res.send(err);
            }
            res.json(updatedUser);
          }
        );
      });
    }
  );
});

router.patch('/send', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  let newPendingInvites = sessionUser.pendingInvites;
  newPendingInvites.push(otherUserID);

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    { pendingInvites: newPendingInvites },
    function(err, user) {
      if (err) {
        res.send(err);
      }
      UserModel.findById(otherUserID, function(err, otherUser) {
        if (err) {
          res.send(err);
        }

        let newPendingRequests = otherUser.pendingRequests;
        newPendingRequests.push(sessionUser.id);

        UserModel.findByIdAndUpdate(
          otherUserID,
          { pendingRequests: newPendingRequests },
          { new: true },
          function(err, updatedUser) {
            if (err) {
              res.send(err);
            }
            res.json(updatedUser);
          }
        );
      });
    }
  );
});

module.exports = router;
