// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
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
  // let hashedPassword = UserModel.hasPassword(req.body.password);
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
    password: body.password,
    description: body.description,
    school: body.school,
    major: body.major,
    minor: body.minor,
    gpa: body.gpa,
    tags: body.tags,
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

// SEARCHING FOR SIMILAR TAGS -> responds with a group of users
router.get('/search', function(req, res) {
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
      'https://randomuser.me/api/?inc=login,name,email,picture,location&results=100'
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

        let newUser = new UserModel({
          name: `${userInfo.name.first} ${userInfo.name.last}`,
          email: userInfo.email,
          password: userInfo.login.password,
          description: `Hey guys, my name's ${userInfo.name.first} ${userInfo
            .name.last}`,
          school: randomSchool,
          major: randomMajor,
          minor: randomMinor,
          gpa: randomGPA,
          tags: tags,
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

module.exports = router;
