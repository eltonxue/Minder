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

$('#send').on('click', function() {
  sendMessage();
});

function updateConnections(sessionUser, users) {
  $('#users-container li').slice(1).remove();
  let connections = sessionUser.connections;
  connections = users.filter(function(user) {
    return connections.indexOf(user._id) > -1;
  });

  connections.forEach(function(recipient) {
    let previewContainer = $('<li></li>', { class: 'preview-container' });
    let preview = $('<div></div>', { class: 'preview' });

    let img = $('<img/>', {
      class: 'profile-image',
      src: recipient.image
    });
    let namePreview = $('<div></div>', { class: 'name-preview' });
    namePreview.text(recipient.name);

    preview.append(img);
    preview.append(namePreview);

    previewContainer.on('click', function(event) {
      // Hash ID of sessionUser and recipient and set it to global currentRoom
      let newRoom = sessionUser._id + recipient._id;

      // Handles case for strings with same characters
      newRoom = newRoom.split('');
      newRoom.sort();
      newRoom = newRoom.join('');

      let oldRoom = currentRoom;

      if (newRoom != oldRoom) {
        if (currentPreview) {
          currentPreview.removeClass('preview-current');
        }

        preview.addClass('preview-current');

        socket.emit('leave', oldRoom);

        currentRoom = newRoom;
        currentPreview = preview;
        currentRecipientID = recipient._id;

        $('#users-container li:first').after(previewContainer);
        $('#users-container').scrollTop(0);

        $('#message-box').attr(
          'placeholder',
          `Chatting with ${recipient.name}`
        );

        socket.emit('join', currentRoom, sessionUser, recipient);
        joinRoom(currentRoom);
      }
    });

    if (recipient._id == currentRecipientID) {
      preview.addClass('preview-current');
      currentPreview = preview;
      previewContainer.append(currentPreview);
      $('#users-container li:first').after(previewContainer);
    } else {
      previewContainer.append(preview);
      $('#users-container').append(previewContainer);
    }
  });
}

function searchConnections(keyword) {
  $.get('/user', function(sessionUser, status) {
    $.get(`/users/search-by-name?name=${keyword}`, function(users, status) {
      updateConnections(sessionUser, users);
    });
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

  let messagesList = $('#messages');
  messagesList.append(messageItem);

  messagesList.css('height', 'unset');

  let height = messagesList.css('height');
  height = parseInt(height.substring(0, height.indexOf('px')));

  if (height >= 390) {
    messagesList.css('height', '405px');
  }

  messages.scrollTop = messages.scrollHeight;
}

var currentRoom = '';
var currentPreview = '';
var currentRecipientID = '';

searchConnections('');

function onSearch(event, input) {
  searchConnections(input.value);
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
  displayMessage(msg);
});
