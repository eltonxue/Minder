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

function updateConnections(sessionUser, users) {
  $('#users-container li').slice(1).remove();
  let connections = sessionUser.connections;
  connections = users.filter(function(user) {
    return connections.indexOf(user._id) > -1;
  });

  connections.forEach(function(requestUser) {
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

    $('#users-container').append(previewContainer);
  });
}

function displayConnections(keyword) {
  $.get('/user', function(sessionUser, status) {
    if (keyword === '') {
      $.get('/users', function(allUsers, status) {
        updateConnections(sessionUser, allUsers);
      });
    } else {
      $.get(`/users/search-by-name?name=${keyword}`, function(users, status) {
        updateConnections(sessionUser, users);
      });
    }
  });
}
var socket = io.connect();
var currentRoom = '';

displayConnections('');

function onSearch(event, input) {
  console.log(input.value);
  displayConnections(input.value);
}

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
