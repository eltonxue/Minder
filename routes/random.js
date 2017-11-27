var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
var UserModel = require('../schemas/user');
var ChatModel = require('../schemas/chat');
var router = express.Router();

// GENERATE RANDOM USERS INTO THE USER DATABASE
router.get('/', function(req, res) {
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
          image: userInfo.picture.large,
          unreadMessages: {}
        });
        newUser.save(function(err, user) {
          if (err) {
            return res.send(err);
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

// GENERATE RANDOM CONNECTIONS FOR EACH EXISTING USER IN USER DATABASE
router.get('/connections', function(req, res) {
  UserModel.find({}, function(err, users) {
    if (err) {
      return res.send(err);
    }

    users.forEach(function(user) {
      const currentid = user._id;

      // Generate random connections
      let n1 = Math.floor(Math.random() * users.length);

      for (let i = 0; i < n1; ++i) {
        let user1 = users[Math.floor(Math.random() * users.length)];
        let userConnections = user.connections;
        let user1Connections = user1.connections;

        const id = user1._id;

        // Add connection
        if (userConnections.indexOf(id) == -1 && id != currentid) {
          userConnections.push(id);

          UserModel.findByIdAndUpdate(
            currentid,
            { connections: userConnections },
            function(err, subUser) {
              if (err) {
                return res.send(err);
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
                return res.send(err);
              }
            }
          );
        }
      }
    });
    return res.send('SUCCESS at generating random connections');
  });
});

// GENERATE PENDING REQUESTS AND INVITES FOR EACH EXISTING USER IN THE USER DATABASE
router.get('/pending-connections', function(req, res) {
  UserModel.find({}, function(err, users) {
    if (err) {
      return res.send(err);
    }
    users.forEach(function(currentUser) {
      const currentid = currentUser._id;

      // Generate random pending invites
      let n = Math.floor(Math.random() * users.length);

      for (let i = 0; i < n; ++i) {
        let otherUser = users[Math.floor(Math.random() * users.length)];

        let newPendingInvites = currentUser.pendingInvites;
        let newPendingRequests = otherUser.pendingRequests;

        let currentUserPendingRequests = currentUser.pendingRequests;
        let currentUserConnections = currentUser.connections;

        let otherUserPendingInvites = otherUser.pendingInvites;
        let otherUserConnections = otherUser.connections;

        const otherid = otherUser._id;

        if (
          currentUserConnections.indexOf(otherid) == -1 &&
          currentUserPendingRequests.indexOf(otherid) == -1 &&
          otherUserConnections.indexOf(currentid) == -1 &&
          otherUserPendingInvites.indexOf(currentid) == -1 &&
          newPendingInvites.indexOf(otherid) == -1 &&
          newPendingRequests.indexOf(currentid) == -1 &&
          otherid != currentid
        ) {
          newPendingInvites.push(otherid);
          newPendingRequests.push(currentid);

          UserModel.findByIdAndUpdate(
            currentid,
            { pendingInvites: newPendingInvites },
            { new: true },
            function(err, newCurrentUser) {
              if (err) {
                return res.send(err);
              }
            }
          );
          UserModel.findByIdAndUpdate(
            otherid,
            { pendingRequests: newPendingRequests },
            function(err, newOtherUser) {
              if (err) {
                return res.send(err);
              }
            }
          );
        }
      }
    });
    return res.send('SUCCESS at generating random pending connections');
  });
});

module.exports = router;
