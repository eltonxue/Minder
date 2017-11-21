var express = require('express');
var crypto = require('crypto');
var ChatModel = require('./routes/chat-model');

class SocketHandler {
  constructor() {}

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
      var socketio = require('./socketio');

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
        io.sockets.in(hashedRoom).emit('message', msg);

        const otherUserSocket = socketio.sockets()[msg.recipient.id];
        if (otherUserSocket) {
          otherUserSocket.emit('push_message', msg);
        }
      });
    });
  }

  handleNotifications(io, socket) {
    socket.on('confirm', function(sessionUser, otherUser) {
      var socketio = require('./socketio');

      console.log(`push the notification for: ${otherUser.name}`);
      const from = sessionUser;
      const otherUserSocket = socketio.sockets()[otherUser._id];

      if (otherUserSocket) {
        console.log(otherUserSocket.id);
        otherUserSocket.emit('push_friend_request', from);
      }
    });
  }
}

module.exports = SocketHandler;
