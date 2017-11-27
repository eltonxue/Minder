var express = require('express');
var crypto = require('crypto');
var ChatModel = require('./schemas/chat');
var UserModel = require('./schemas/user');

class SocketHandler {
  constructor() {}

  handleMessaging(io, socket) {
    let sender = {};
    let recipient = {};

    socket.on('join', function(room, from, to) {
      var socketio = require('./socketio');

      let hashedRoom = crypto.createHash('md5').update(room).digest('hex');
      console.log('Joined room #' + hashedRoom);
      sender = from;
      recipient = to;
      socket.join(hashedRoom);

      const senderID = sender._id;
      const recipientID = recipient._id;
      const otherUserSocket = socketio.sockets()[recipientID];

      let { unreadMessages } = sender;
      // Check if recipientID is in sender.unreadMessages keys
      if (
        unreadMessages &&
        Object.keys(unreadMessages).indexOf(recipientID) != -1
      ) {
        delete unreadMessages[recipientID];

        UserModel.findByIdAndUpdate(senderID, { unreadMessages }, { new: true })
          .then(function(user) {
            socket.emit(
              'push_unread',
              Object.values(user.unreadMessages).reduce(function(a, b) {
                return a + b;
              }, 0)
            );
          })
          .catch(function(err) {
            console.log(err);
          });
      }
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
        date: Date.now(),
        sender: {
          id: sender._id,
          name: sender.name,
          image: sender.image
        },
        recipient: {
          id: recipient._id,
          name: recipient.name,
          image: recipient.image
        },
        message,
        room: hashedRoom
      })
        .then(function(msg) {
          io.sockets.in(hashedRoom).emit('message', msg);

          const senderID = msg.sender.id;
          const recipientID = msg.recipient.id;
          const otherUserSocket = socketio.sockets()[recipientID];

          // Do not do this if otherUserSocket exists IN the room
          let exists =
            io.sockets.adapter.rooms[hashedRoom].sockets[otherUserSocket.id];

          if (otherUserSocket && !exists) {
            otherUserSocket.emit('push_message', msg);

            UserModel.findById(recipientID)
              .then(function(recipient) {
                let { unreadMessages } = recipient;
                if (!unreadMessages) {
                  unreadMessages = {};
                }
                if (senderID in unreadMessages) {
                  unreadMessages[senderID] += 1;
                } else {
                  unreadMessages[senderID] = 1;
                }

                UserModel.findByIdAndUpdate(
                  recipientID,
                  { unreadMessages },
                  { new: true }
                ).then(function(user) {
                  otherUserSocket.emit(
                    'push_unread',
                    Object.values(user.unreadMessages).reduce(function(a, b) {
                      return a + b;
                    }, 0)
                  );
                });
              })
              .catch(function(err) {
                console.log(err);
              });
          }
        })
        .catch(function(err) {
          console.log(err);
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
        otherUserSocket.emit('push_friend_request', from);
      }
    });
  }
}

module.exports = SocketHandler;
