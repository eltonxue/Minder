var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var user = require('./routes/user');
var users = require('./routes/users');

var app = express();

// Mongoose
// Connects to the "test" database in MongoDB
mongoose.connect('mongodb://localhost/users');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB Connected!');
  //
  // // Creates a schema using mongoose with key, value attributes: name that's a String
  // var kittySchema = mongoose.Schema({
  //   name: String
  // });
  //
  // // Creates a new class "Kitten", that takes the kittySchema schema
  // var Kitten = mongoose.model('Kitten', kittySchema);
  //
  // // Creates a new "Kitten" with the name 'Silence'
  // var silence = new Kitten({ name: 'Silence' });
  // console.log(silence.name); // 'Silence'
  //
  // kittySchema.methods.speak = function() {
  //   var greeting = this.name
  //     ? 'Meow name is ' + this.name
  //     : "I don't have a name";
  //   console.log(greeting);
  //
  //   var fluffy = new Kitten({ name: 'fluffy' });
  //   fluffy.speak(); // "Meow name is fluffy"
  //
  //   fluffy.save(function(err, fluffy) {
  //     if (err) return console.error(err);
  //     fluffy.speak();
  //   });
  //
  //   Kitten.find(function(err, kittens) {
  //     if (err) return console.error(err);
  //     console.log(kittens);
  //   });
  //
  //   Kitten.find({ name: /^fluff/ }, callback);
  // };
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', user);
app.use('/users', users);

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
