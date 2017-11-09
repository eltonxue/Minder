function onSend(event, textarea) {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    sendMessage();
  }
}

function sendMessage() {
  // Create HTML
  let input = $('#message-box');

  // Emit to socket the text input
  socket.emit('send', input.val(), currentRoom);

  input.val('');
}

document.getElementById('send').onclick = function() {
  sendMessage();
};

function displayConnections() {
  $.get('/user', function(sessionUser, status) {
    let connections = sessionUser.connections;

    const usersContainer = $('#users-container');

    $.get('/users', function(allUsers, status) {
      connections.forEach(function(userID) {
        var requestUser = $.grep(allUsers, function(user) {
          return user._id === userID;
        });

        requestUser = requestUser[0];

        let previewContainer = $('<li></li>');
        let preview = $('<div></div>', { class: 'users-message' });

        let img = $('<img/>', {
          class: 'profile-image',
          src: requestUser.image
        });
        let namePreview = $('<div></div>', { class: 'name-preview' });
        namePreview.text(requestUser.name);

        preview.append(img);
        preview.append(namePreview);
        previewContainer.append(preview);

        previewContainer.on('click', function(event) {
          // Hash ID of sessionUser and requestUser and set it to global currentRoom

          let newRoom = sessionUser._id + requestUser._id;

          // Handles case for strings with same characters
          newRoom = newRoom.split('');
          newRoom.sort();
          newRoom = newRoom.join('');

          let oldRoom = currentRoom;

          socket.emit('leave', oldRoom);

          currentRoom = newRoom;

          console.log(currentRoom);

          // Emit room name
          socket.emit('join', currentRoom, sessionUser);

          $('#message-box').attr(
            'placeholder',
            `Chatting with ${requestUser.name}`
          );
          // Clear messages, add "User has entered"
          if (newRoom != oldRoom) {
            socket.emit('send', 'has left the chat room.', oldRoom);
            $('#messages').empty();
            socket.emit('send', 'has joined the chat room.', currentRoom);
          }

          // Change background color to lightgrey

          // Change background color of old room to white
        });

        usersContainer.append(previewContainer);
      });
    });
  });
}
var socket = io.connect();
var currentRoom = '';

displayConnections();

socket.on('connect', function() {
  // Connected, let's sign-up for to receive messages for this room
});

socket.on('message', function(data, sessionUser) {
  console.log('Session User:', sessionUser);
  console.log('Incoming message:', data);

  let message = $('<p></p>', { class: 'message-text' });
  message.text(data);

  let profileIcon = $('<img />', {
    class: 'profile-icon-image',
    src: sessionUser.image
  });

  let messageItem = $('<div></div>', { class: 'message-item' });

  messageItem.append(profileIcon);
  messageItem.append(message);

  $('#messages').append(messageItem);

  messages.scrollTop = messages.scrollHeight;
});
