var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('../schemas/user');
var router = express.Router();

router.patch('/remove', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    {
      $pull: { connections: otherUserID }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
    }
  );

  UserModel.findByIdAndUpdate(
    otherUserID,
    {
      $pull: { connections: sessionUser.id }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }

      res.json(user);
    }
  );
});

router.patch('/accept', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    {
      $push: { connections: otherUserID },
      $pull: { pendingRequests: otherUserID }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
    }
  );

  UserModel.findByIdAndUpdate(
    otherUserID,
    {
      $push: { connections: sessionUser.id },
      $pull: { pendingInvites: sessionUser.id }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
      res.json(user);
    }
  );
});

router.patch('/deny', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    {
      $pull: { pendingRequests: otherUserID }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
    }
  );

  UserModel.findByIdAndUpdate(
    otherUserID,
    {
      $pull: { pendingInvites: sessionUser.id }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
      res.json(user);
    }
  );
});

router.patch('/cancel', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    {
      $pull: { pendingInvites: otherUserID }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
    }
  );

  UserModel.findByIdAndUpdate(
    otherUserID,
    {
      $pull: { pendingRequests: sessionUser.id }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
      res.json(user);
    }
  );
});

router.patch('/send', function(req, res, next) {
  const sessionUser = req.session.user;
  const otherUserID = req.body.id;

  UserModel.findByIdAndUpdate(
    sessionUser.id,
    {
      $push: { pendingInvites: otherUserID }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
    }
  );

  UserModel.findByIdAndUpdate(
    otherUserID,
    {
      $push: { pendingRequests: sessionUser.id }
    },
    function(err, user) {
      if (err) {
        return res.send(err);
      }
      res.json(user);
    }
  );
});

module.exports = router;
