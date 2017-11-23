var express = require('express');
var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  date: String,
  sender: { id: String, name: String, image: String },
  recipient: { id: String, name: String, image: String },
  message: String,
  room: String
});

var MessageModel = mongoose.model('message', messageSchema);

module.exports = MessageModel;
