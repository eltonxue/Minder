var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const saltRounds = 10;

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  description: String,
  password: String,
  school: String,
  major: String,
  minor: String,
  gpa: String,
  tags: [String],
  connections: [String], // Array of user IDs
  pendingInvites: [String],
  pendingRequests: [String],
  // messageHistory = { to (id) : [ { from (id): message } ] }
  location: {
    name: String,
    geo: {
      type: { type: String },
      coordinates: { type: Array } // SHOULD BE LNG, LAT
    }
  },
  image: String
});

userSchema.index({ 'location.geo': '2dsphere' });

class UserClass {
  static hashPassword(password) {
    return bcrypt.hashSync(password, saltRounds);
  }

  checkPassword(password) {
    return password === this.password;
    // return bcrypt.compareSync(password, this.password);
  }
}

userSchema.loadClass(UserClass);

var UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
