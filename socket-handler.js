var express = require('express');
var crypto = require('crypto');
var ChatModel = require('./routes/chat-model');

class SocketHandler {
  constructor() {
    console.log('A user connected');
  }

  handleMessaging(io, socket) {
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
        sender: {
          id: sender._id,
          name: sender.name,
          image: sender.image
        },
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
  }
}

module.exports = SocketHandler;
