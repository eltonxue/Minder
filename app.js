var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('client-sessions');
var socketio = require('socket.io');
var crypto = require('crypto');

var index = require('./routes/index');
var user = require('./routes/user');
var users = require('./routes/users');
var action = require('./routes/action');
var UserModel = require('./routes/user-model');
var ChatModel = require('./routes/chat-model');

var app = express();

// Socket.io
var io = socketio();
app.io = io;

io.on('connection', function(socket) {
  console.log('A user connected');

  let sender = {};
  let receiver = {};

  socket.on('join', function(room, from, to) {
    let hashedRoom = crypto.createHash('md5').update(room).digest('hex');
    console.log('Joined room #' + hashedRoom);
    sender = from;
    receiver = to;
    socket.join(hashedRoom);
  });

  socket.on('leave', function(room) {
    let hashedRoom = crypto.createHash('md5').update(room).digest('hex');
    console.log('Left room #' + hashedRoom);
    socket.leave(hashedRoom);
  });

  socket.on('send', function(message, room) {
    // SAVE MESSAGE INTO CHAT MODEL
    let hashedRoom = crypto.createHash('md5').update(room).digest('hex');

    ChatModel.create({
      date: Math.floor(Date.now()),
      sender: { id: sender._id, name: sender.name, image: sender.image },
      recipient: {
        id: receiver._id,
        name: receiver.name,
        image: receiver.image
      },
      message,
      room: hashedRoom
    }).then(function(msg) {
      io.sockets.in(hashedRoom).emit('message', msg, sender);
    });
  });
});

// Mongoose
// Connects to the "users" database in MongoDB
mongoose.connect('mongodb://localhost/users');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB Connected!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(
  session({
    cookieName: 'session',
    secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
  })
);

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
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

app.use('/action', action);
app.use('/users', users);
app.use('/user', user);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
