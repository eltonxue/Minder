// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
var crypto = require('crypto');
var UserModel = require('./user-model');
var ChatModel = require('./chat-model');
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
    image: body.image
  });

  newUser.save(function(err, user) {
    if (err) {
      res.send(err);
    }

    res.json(user);
  });
});

/* LOGGING IN */
router.post('/login', function(req, res, next) {
  UserModel.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      res.send(err);
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
      // io.sockets.emit('joined', messages, sender);
    })
    .catch(function(err) {
      res.send(err);
    });
});

// SEARCHING BY NAME
router.get('/search-by-name', function(req, res) {
  var name = req.query.name;
  console.log(req.session.user);
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
    }
  })
    .lean()
    .exec()
    .then(function(users) {
      users.forEach(function(user) {
        // user = user.toObject();
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
      res.send(err);
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
    .then(function(docs) {
      console.log(docs);
      res.json(docs);
    });
});

// GETTING RANDOM USERS GLOBALLY
router.get('/global', function(req, res) {
  UserModel.find({}, function(err, users) {
    let globalUsers = [];
    for (let i = 0; i < parseInt(req.query.results); ++i) {
      globalUsers.push(users[Math.round(Math.random() * users.length)]);
    }
    res.json(globalUsers);
  });
});

/* GET generated random users and save to database*/
router.get('/random', function(req, res) {
  const randomTags = [
    'basketball',
    'hiking',
    'soccer',
    'cooking',
    'muay thai',
    'coding',
    'league of legends',
    'live streaming',
    'baking',
    'eating',
    'hanging out with friends',
    'sleeping',
    'rubix cubes'
  ];

  const randomLocations = [
    {
      name: 'Irvine, CA',
      geo: {
        type: 'Point',
        coordinates: [-117.82, 33.68]
      }
    },
    {
      name: 'San Francisco, CA',
      geo: {
        type: 'Point',
        coordinates: [-122.42, 33.77]
      }
    },
    {
      name: 'Los Angeles, CA',
      geo: {
        type: 'Point',
        coordinates: [-118.24, 34.05]
      }
    },
    {
      name: 'New York City, NY',
      geo: {
        type: 'Point',
        coordinates: [-74.006, 40.71]
      }
    },
    {
      name: 'Miami, FL',
      geo: {
        type: 'Point',
        coordinates: [-80.1918, 25.761]
      }
    }
  ];

  const randomSchools = [
    'UC Irvine',
    'SF State',
    'UC Davis',
    'San Jose State University'
  ];

  const randomStudies = [
    'Computer Science',
    'Economics',
    'Accounting',
    'Statistics',
    'Biomedical Engineering'
  ];

  const randomGPAs = ['3.44', '3.00', '4.00', '3.64', '3.50', '2.80', '2.30'];

  axios
    .get(
      'https://randomuser.me/api/?inc=login,name,email,picture,location&results=50'
    )
    .then(function(response) {
      response.data.results.forEach(function(userInfo) {
        let randomSchool =
          randomSchools[Math.floor(Math.random() * randomSchools.length)];
        let randomMajor =
          randomStudies[Math.floor(Math.random() * randomStudies.length)];
        let randomMinor =
          randomStudies[Math.floor(Math.random() * randomStudies.length)];
        let randomGPA =
          randomGPAs[Math.floor(Math.random() * randomGPAs.length)];

        let randomLocation =
          randomLocations[Math.floor(Math.random() * randomLocations.length)];

        let tags = [];
        for (
          let i = 0;
          i < Math.floor(Math.random() * randomTags.length);
          ++i
        ) {
          let random =
            randomTags[Math.floor(Math.random() * randomTags.length)];
          if (tags.indexOf(random) == -1) {
            tags.push(random);
          }
        }

        let hashedPassword = UserModel.hashPassword(userInfo.login.password);
        let newUser = new UserModel({
          name: `${userInfo.name.first} ${userInfo.name.last}`,
          email: userInfo.email,
          password: hashedPassword,
          description: `Hey guys, my name's ${userInfo.name.first} ${userInfo
            .name.last}`,
          school: randomSchool,
          major: randomMajor,
          minor: randomMinor,
          gpa: randomGPA,
          tags: tags,
          connections: [],
          pendingInvites: [],
          pendingRequests: [],
          location: randomLocation,
          image: userInfo.picture.large
        });
        newUser.save(function(err, user) {
          if (err) {
            res.send(err);
          }
        });
      });
      res.send('SUCCESS');
    })
    .catch(function(error) {
      console.error(error);
      res.send(error);
    });
});

router.get('/random-connections', function(req, res) {
  // Generate random connections & pending connections
  UserModel.find({}, function(err, users) {
    if (err) {
      res.send(err);
    }

    users.forEach(function(user) {
      const currentid = user._id;

      // Generate random connections
      let n1 = Math.floor(Math.random() * users.length);

      for (let i = 0; i < n1; ++i) {
        let user1 = users[Math.floor(Math.random() * users.length)];
        let userConnections = user.connections;
        let user1Connections = user1.connections;

        let id = user1._id;

        // Add connection
        if (userConnections.indexOf(id) == -1 && id != currentid) {
          userConnections.push(id);

          UserModel.findByIdAndUpdate(
            currentid,
            { connections: userConnections },
            function(err, subUser) {
              if (err) {
                res.send(err);
              }
            }
          );
        }

        // Add connection to other user
        if (user1Connections.indexOf(currentid) == -1 && id != currentid) {
          user1Connections.push(currentid);

          UserModel.findByIdAndUpdate(
            id,
            { connections: user1Connections },
            function(err, subUser) {
              if (err) {
                res.send(err);
              }
            }
          );
        }
      }

      // Generate random pending invites
      let n2 = Math.floor(Math.random() * users.length);

      for (let i = 0; i < n2; ++i) {
        let user2 = users[Math.floor(Math.random() * users.length)];
        let newPendingInvites = user.pendingInvites;
        let newPendingRequests = user2.pendingRequests;
        let userConnections = user.connections;

        const id = user2._id;

        if (
          userConnections.indexOf(id) == -1 &&
          newPendingInvites.indexOf(id) == -1 &&
          newPendingRequests.indexOf(currentid) == -1 &&
          id != currentid
        ) {
          newPendingInvites.push(id);
          newPendingRequests.push(currentid);

          UserModel.findByIdAndUpdate(
            currentid,
            { pendingInvites: newPendingInvites },
            function(err, user) {
              if (err) {
                res.send(err);
              }
            }
          );

          UserModel.findByIdAndUpdate(
            id,
            { pendingRequests: newPendingRequests },
            function(err, user) {
              if (err) {
                res.send(err);
              }
            }
          );
        }
      }

      // Generate random pending requests
      let n3 = Math.floor(Math.random() * users.length);

      for (let i = 0; i < n3; ++i) {
        let user3 = users[Math.floor(Math.random() * users.length)];
        let newPendingRequests = user.pendingInvites;
        let newPendingInvites = user3.pendingInvites;
        let userConnections = user.connections;

        let id = user3._id;

        if (
          userConnections.indexOf(id) == -1 &&
          newPendingRequests.indexOf(id) == -1 &&
          newPendingInvites.indexOf(id) == -1 &&
          id != currentid
        ) {
          newPendingRequests.push(id);
          newPendingInvites.push(currentid);

          UserModel.findByIdAndUpdate(
            currentid,
            { pendingRequests: newPendingRequests },
            function(err, user) {
              if (err) {
                res.send(err);
              }
            }
          );

          UserModel.findByIdAndUpdate(
            id,
            { pendingInvites: newPendingInvites },
            function(err, user) {
              if (err) {
                res.send(err);
              }
            }
          );
        }
      }
    });

    res.send('SUCCESS');
  });
});

module.exports = router;
