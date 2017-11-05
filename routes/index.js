var express = require('express');
var mongoose = require('mongoose');
var UserModel = require('./model');
var request = require('request');
var router = express.Router();

// ******************
// *** MIDDLEWARE ***
// ******************

// Given [User], find if User is inside [User]
function containsUser(user, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]._id.equals(user._id)) {
      return i;
    }
  }
  return -1;
}

// Get distance between coordinates in km
function getDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
}

router.use(function(req, res, next) {
  if (req.session && req.session.user) {
    UserModel.findOne({ email: req.session.user.email }, function(err, user) {
      if (err) {
        res.send(err);
      }
      if (user) {
        req.user = user;
        delete req.user.password; // Delete the password from the session
        req.session.user = user; // Refresh the session value
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

// **************
// *** ROUTES ***
// **************

/* GET authentication page. */
router.get('/', function(req, res, next) {
  res.render('signup-login-page');
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
      if (req.body.password === user.password) {
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

/* GET session profile page. */
router.get('/self-profile', requireLogin, function(req, res, next) {
  res.render('self-profile', { user: req.session.user });
});

/* GET discovery page. */
router.get('/discovery', function(req, res, next) {
  // Query through user database and return:
  // {similarTags: [user..., similar: 2], local: [user...], random: [user...]}
  // based on current session user, then pass as data to EJS template
  let discover = { similarTags: [], locals: [], random: [] };

  for (let i = 0; i < req.session.user.tags.length; ++i) {
    UserModel.find({ tags: req.session.user.tags[i] }, function(err, users) {
      if (err) {
        res.send(err);
      }

      // Populating similarTags
      for (let n = 0; n < users.length; ++n) {
        let index = containsUser(users[n], discover.similarTags);
        if (index != -1) {
          discover.similarTags[index].similar += 1;
        } else {
          let user = users[n];
          user.similar = 1;
          discover.similarTags.push(user);
        }
      }

      // Sort by largest similarity tags
      discover.similarTags.sort(function(a, b) {
        return b.similar - a.similar;
      });
    });
  }

  // Populating locals
  let address = req.session.user.location;
  address = address.replace(' ', '+');

  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8`;

  request(URL, function(err, res, data) {
    if (err) {
      res.send(err);
    }
    let json = JSON.parse(data);
    const currentLat = json.results[0].geometry.location.lat;
    const currentLng = json.results[0].geometry.location.lng;
    console.log(`Current lat: ${currentLat}, Current lng: ${currentLng}`);
    // const currentLat = data.results[0];
    UserModel.find({}, function(err, users) {
      if (err) {
        res.send(err);
      }

      for (let i = 0; i < users.length; ++i) {
        let newURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${users[
          i
        ].location}&key=AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8`;
        request(newURL, function(err, res, jsonData) {
          if (err) {
            res.send(err);
          }
          let info = JSON.parse(jsonData);
          const otherLat = info.results[0].geometry.location.lat;
          const otherLng = info.results[0].geometry.location.lng;

          console.log(getDistance(currentLat, currentLng, otherLat, otherLng));
          if (getDistance(currentLat, currentLng, otherLat, otherLng) <= 50) {
            discover.locals.push(users[i]);
          }
        });
      }
    });
  });

  setTimeout(function() {
    console.log(discover.locals);
    console.log(discover.locals.length);
    console.log(discover.similarTags);
    console.log(discover.similarTags.length);
    res.render('discovery');
  }, 3000);
});

/* GET other user profile page. */
router.get('/user-profile', function(req, res, next) {
  res.render('user-profile');
});

/* GET connect page. */
router.get('/connect', function(req, res, next) {
  res.render('connect');
});

/* GET messages page. */
router.get('/messages', function(req, res, next) {
  res.render('messages');
});

/* LOGGING OUT */
router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;
