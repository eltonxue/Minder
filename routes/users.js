// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
var crypto = require('crypto');
var UserModel = require('../schemas/user');
var ChatModel = require('../schemas/chat');
var router = express.Router();

// req -> what we're RECEIVING to the server, the data
// res -> what we're SENDING BACK to the client

/* GET users listing. */
router.get('/', function(req, res, next) {
  UserModel.find({}, function(err, users) {
    if (err) {
      return res.send(err);
    }
    res.send(users);
  });
});

/* POST new user with user data*/
router.post('/', function(req, res) {
  let hashedPassword = UserModel.hashPassword(req.body.password);

  let body = req.body;
  body.location.geo.coordinates[0] = parseFloat(
    body.location.geo.coordinates[0]
  );
  body.location.geo.coordinates[1] = parseFloat(
    body.location.geo.coordinates[1]
  );
  var newUser = new UserModel({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    description: body.description,
    school: body.school,
    major: body.major,
    minor: body.minor,
    gpa: body.gpa,
    tags: body.tags,
    connections: body.connections,
    pendingInvites: body.pendingInvites,
    pendingRequests: body.pendingRequests,
    location: body.location,
    image: body.image,
    unreadMessages: body.unreadMessages
  });

  newUser.save(function(err, user) {
    if (err) {
      return res.send(err);
    }

    res.json(user);
  });
});

/* LOGGING IN */
router.post('/login', function(req, res, next) {
  UserModel.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    if (!user) {
      res.send({
        error: 'email',
        code: "<p class='error'>Email does not exist</p>"
      });
    } else {
      let checkPassword = user.checkPassword(req.body.password);
      if (checkPassword) {
        console.log('SUCCESSFULLY LOGGED IN');
        // Sets a cookie with the user's info
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

// SEARCH FOR ROOM MESSAGES
router.get('/search-by-room', function(req, res) {
  let hashedRoom = crypto
    .createHash('md5')
    .update(req.query.room)
    .digest('hex');
  ChatModel.find({ room: hashedRoom })
    .then(function(data) {
      let messages = data;
      messages.sort(function(a, b) {
        return a.date > b.date;
      });
      res.json({ sessionUser: req.session.user, messages });
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// SEARCHING BY IDS
router.get('/search-by-ids', function(req, res) {
  var ids = req.query.ids.split(',');
  ids = ids.map(function(id) {
    return mongoose.Types.ObjectId(id);
  });
  UserModel.find({ _id: { $in: ids } })
    .then(function(users) {
      res.json(users);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// SEARCHING BY NAME
router.get('/search-by-name', function(req, res) {
  var name = req.query.name;
  UserModel.find({
    name: new RegExp(`^${name}`, 'i'),
    _id: { $ne: req.session.user._id }
  }).then(function(users) {
    res.json(users);
  });
});

// SEARCHING FOR SIMILAR TAGS -> responds with a group of users
router.get('/search-similar-tags', function(req, res) {
  var tags = req.query.tags.split(',');
  UserModel.find({
    tags: {
      $in: tags
    },
    _id: {
      $nin: req.session.user.connections,
      $ne: req.session.user.id
    }
  })
    .lean()
    .exec()
    .then(function(users) {
      users.forEach(function(user) {
        let count = 0;
        tags.forEach(function(tag) {
          if (user.tags.includes(tag)) {
            count++;
          }
        });

        user.tagMatches = count;
        return user;
      });

      users.sort(function(a, b) {
        return b.tagMatches - a.tagMatches;
      });

      res.json(users);
    })
    .catch(function(err) {
      return res.send(err);
    });
});

// GETTING USERS USING GEOJSON
router.get('/near', function(req, res) {
  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);
  UserModel.where('location.geo')
    .near({
      center: {
        coordinates: [lng, lat],
        type: 'Point'
      },
      maxDistance: 50000 // 31 miles
    })
    .where('_id')
    .nin(req.session.user.connections)
    .where('_id')
    .ne(req.session.user.id)
    .then(function(docs) {
      console.log(docs);
      res.json(docs);
    });
});

// GETTING RANDOM USERS GLOBALLY
router.get('/global', function(req, res) {
  UserModel.find(
    {
      _id: {
        $nin: req.session.user.connections,
        $ne: req.session.user.id
      }
    },
    function(err, users) {
      let globalUsers = [];
      for (let i = 0; i < parseInt(req.query.results); ++i) {
        globalUsers.push(users[Math.round(Math.random() * users.length)]);
      }
      res.json(globalUsers);
    }
  );
});

module.exports = router;
