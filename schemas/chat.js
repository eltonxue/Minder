var express = require('express');
var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  date: Number, // Date in unix timestamps
  sender: Object,
  recipient: Object,
  message: String,
  room: String
});

var MessageModel = mongoose.model('message', messageSchema);

module.exports = MessageModel;
