var SocketHandler = require('./socket-handler');

let io = null;
let sockets = {};
module.exports = {
  init: function(server) {
    io = require('socket.io')(server);
    io.on('connection', function(socket) {
      let userId = socket.handshake.query.id;
      sockets[userId] = socket;
      console.log(`User ID: ${userId} has connected.`);
      console.log(`Socket ID: ${socket.id}`);

      let socketHandler = new SocketHandler();

      socketHandler.handleMessaging(io, socket);
      socketHandler.handleNotifications(io, socket);
    });
  },
  instance: function() {
    return io;
  },
  sockets: function() {
    return sockets;
  }
};
