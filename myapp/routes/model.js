var express = require('express');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  description: String,
  password: String,
  school: String,
  major: String,
  minor: String,
  gpa: String,
  tags: Array,
  location: String,
  image: Object
});

var UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
