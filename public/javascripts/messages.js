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
  if (input.val().trim()) {
    socket.emit('send', input.val(), currentRoom);
  }

  input.val('');
}

$('#send').click('click', function() {
  sendMessage();
});

function updateConnections(sessionUser, users) {
  $('#users-container li').slice(1).remove();
  let connections = sessionUser.connections;
  connections = users.filter(function(user) {
    return connections.indexOf(user._id) > -1;
  });

  connections.forEach(function(requestUser) {
    let previewContainer = $('<li></li>', { class: 'preview-container' });
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

      if (newRoom != oldRoom) {
        socket.emit('leave', oldRoom);

        currentRoom = newRoom;

        $('#message-box').attr(
          'placeholder',
          `Chatting with ${requestUser.name}`
        );
        // Clear messages, add "User has entered"

        socket.emit('join', currentRoom, sessionUser, requestUser);
        joinRoom(currentRoom);
      }
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

function displayMessage(msg) {
  let message = $('<p></p>', { class: 'message-text' });
  message.html(
    `<span class="message-sender-name">(${msg.sender.name.split(
      ' '
    )[0]})</span>${msg.message}`
  );

  let profileIcon = $('<img />', {
    class: 'profile-icon-image',
    src: msg.sender.image
  });

  let messageItem = $('<div></div>', { class: 'message-item' });

  messageItem.append(profileIcon);
  messageItem.append(message);

  $('#messages').append(messageItem);

  messages.scrollTop = messages.scrollHeight;
}

var socket = io.connect();
var currentPreview = $('<li></li>');
var currentRoom = '';

displayConnections('');

function onSearch(event, input) {
  displayConnections(input.value);
}

function joinRoom(room) {
  $.get(`/users/search-by-room?room=${room}`).then(function(data) {
    $('#messages').empty();
    const sessionUser = data.sessionUser;
    const messages = data.messages;
    messages.forEach(function(msg) {
      displayMessage(msg);
    });
  });
}

socket.on('message', function(msg) {
  // console.log(currentRoom);
  // joinRoom(currentRoom);
  displayMessage(msg);
});

socket.on('connect', function() {
  // Connected, let's sign-up for to receive messages for this room
});
