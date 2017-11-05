// *****************
// *** GET, POST ***
// *****************

var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var https = require('https');
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
  console.log(req.body);
  // res.send(req.body)

  var newUser = new UserModel({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    description: req.body.description,
    school: req.body.school,
    major: req.body.major,
    minor: req.body.minor,
    gpa: req.body.gpa,
    tags: req.body.tags,
    location: req.body.location,
    image: req.body.image
  });

  newUser.save(function(err, user) {
    if (err) {
      res.send(err);
    }

    res.json(user);
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
    'Irvine, CA',
    'San Francisco, CA',
    'Los Angeles, CA',
    'New York City, NY',
    'Miami, FL'
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

  let randomSchool =
    randomSchools[Math.floor(Math.random() * randomSchools.length)];
  let randomMajor =
    randomStudies[Math.floor(Math.random() * randomStudies.length)];
  let randomMinor =
    randomStudies[Math.floor(Math.random() * randomStudies.length)];
  let randomGPA = randomGPAs[Math.floor(Math.random() * randomGPAs.length)];

  let tags = [];
  for (let i = 0; i < Math.floor(Math.random() * randomTags.length); ++i) {
    let random = randomTags[Math.floor(Math.random() * randomTags.length)];
    if (tags.indexOf(random) == -1) {
      tags.push(random);
    }
  }

  let randomLocation =
    randomLocations[Math.floor(Math.random() * randomLocations.length)];

  https
    .get(
      'https://randomuser.me/api/?inc=login,name,email,picture,location',
      function(response) {
        response.on('data', function(data) {
          let json = JSON.parse(data);
          let userInfo = json.results[0];
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

            res.json(user);
          });
        });
      }
    )
    .on('error', function(error) {
      console.error(error);
    });
});

module.exports = router;
