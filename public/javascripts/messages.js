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

function updateConnections(users) {
  $.get('/user', function(sessionUser, status) {
    $('#users-container li').slice(1).remove();
    let connections = sessionUser.connections;
    connections = users.filter(function(user) {
      return connections.indexOf(user._id) > -1;
    });

    connections.forEach(function(recipient) {
      let previewContainer = $('<li></li>', { class: 'preview-container' });
      let preview = $('<div></div>', { class: 'preview' });

      preview.attr('data-id', recipient._id);

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
        let newRoom = [sessionUser._id, recipient._id];
        newRoom.sort();
        newRoom = newRoom.join('');

        let oldRoom = currentRoom;

        // If session user clicks joins another room
        if (newRoom != oldRoom) {
          if (currentPreview) {
            currentPreview.removeClass('preview-current');
          }

          preview.addClass('preview-current');

          socket.emit('leave', oldRoom);

          currentRoom = newRoom;
          currentPreview = preview;
          currentRecipientID = recipient._id;

          $('#message-box').attr(
            'placeholder',
            `Chatting with ${recipient.name}`
          );
          $.get('/user', function(sessionUser, status) {
            socket.emit('join', currentRoom, sessionUser, recipient);
          });

          joinRoom(currentRoom);
        }
      });

      if (recipient._id == currentRecipientID) {
        preview.addClass('preview-current');
        currentPreview = preview;
        previewContainer.append(currentPreview);
        $('#users-container').append(previewContainer);
      } else {
        previewContainer.append(preview);
        $('#users-container').append(previewContainer);
      }
    });
  });
}

function searchConnections(keyword) {
  $.get(`/users/search-by-name?name=${keyword}`, function(users, status) {
    updateConnections(users);
  });
}

function displayUnreadMessages() {
  $.get('/user', function(sessionUser, status) {
    if (sessionUser.unreadMessages) {
      $.get(
        `/users/search-by-ids?ids=${Object.keys(
          sessionUser.unreadMessages
        ).join(',')}`,
        function(unreadUsers, status) {
          unreadUsers.forEach(function(user) {
            const sessionUserID = sessionUser._id;
            const otherUserID = user._id;
            let info = $('<div></div>');
            info.html(
              `<strong>${user.name}</strong> | Unread Messages <strong>(${sessionUser
                .unreadMessages[
                otherUserID
              ]})</strong><br/><i>Click to Clear</i>`
            );

            let profileIcon = $('<img />', {
              src: user.image
            });

            let unreadMessageContainer = $('<li></li>', {
              class: 'unread-message'
            });

            unreadMessageContainer.append(profileIcon);
            unreadMessageContainer.append(info);

            unreadMessageContainer.on('click', function(event) {
              let newRoom = [sessionUserID, otherUserID];
              newRoom.sort();
              newRoom = newRoom.join('');

              currentRoom = newRoom;
              currentRecipientID = otherUserID;

              $('#message-box').attr(
                'placeholder',
                `Chatting with ${user.name}`
              );

              socket.emit('join', currentRoom, sessionUser, user);
              joinRoom(currentRoom);

              let previewsList = $('.preview');
              for (let i = 0; i < previewsList.length; ++i) {
                let preview = $(previewsList[i]);
                if (preview.data('id') == otherUserID) {
                  preview.addClass('preview-current');
                  currentPreview = preview;
                }
              }

              let unreadMessages = sessionUser.unreadMessages;
              const text = $('#unread-count').text();
              const start = text.indexOf('(');
              const end = text.indexOf(')');
              const unread = parseInt(text.substring(start + 1, end));

              // Subtract unread messages count
              let unreadCount = unread - unreadMessages[otherUserID];
              $('#unread-count').html(`Messages (${unreadCount})`);

              delete unreadMessages[otherUserID];

              $.ajax({
                url: '/user',
                type: 'PATCH',
                data: JSON.stringify({ unreadMessages }),
                contentType: 'application/json'
              });
            });

            $('#messages').append(unreadMessageContainer);
          });
        }
      );
    }
  });
}

function displayMessage(msg) {
  let message = $('<p></p>', { class: 'message-text' });
  message.text(msg.message);

  let profileIcon = $('<img />', {
    class: 'profile-icon-image',
    src: msg.sender.image
  });

  let messageItem = $('<li></li>', { class: 'message-item' });

  if (msg.sender.id != currentRecipientID) {
    messageItem.attr('class', 'message-item sender');
    messageItem.append(message);
    messageItem.append(profileIcon);
  } else {
    messageItem.attr('class', 'message-item recipient');
    messageItem.append(profileIcon);
    messageItem.append(message);
  }

  const messagesList = $('#messages');
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
displayUnreadMessages();

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
