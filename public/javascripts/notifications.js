function acceptConnection(id) {
  const otherUserID = id;

  $.ajax({
    url: '/action/accept',
    type: 'PATCH',
    data: JSON.stringify({
      id: otherUserID
    }),
    contentType: 'application/json',
    success: function(otherUser, textStatus, jqXhr) {
      console.log('Successful Patch!');
      console.log(otherUser);
    }
  });
}

function denyConnection(id) {
  const otherUserID = id;

  $.ajax({
    url: '/action/deny',
    type: 'PATCH',
    data: JSON.stringify({
      id: otherUserID
    }),
    contentType: 'application/json',
    success: function(otherUser, textStatus, jqXhr) {
      console.log('Successful Patch!');
      console.log(otherUser);
    }
  });
}

function removeNotification() {
  notificationContainer.animate({ opacity: 0 }, 200, function() {
    notificationContainer.css('display', 'none');
    notificationContainer.css('margin-right', '0');
    notificationContainer.empty();
  });
}

const notificationContainer = $('#notification-container');

socket.on('push_friend_request', function(from) {
  console.log(`friend request notification from: ${from.name} `);

  // Create development

  notificationContainer.css('display', 'none');
  notificationContainer.css('opacity', '0');
  notificationContainer.css('margin-right', '0');
  notificationContainer.empty();

  let image = $('<img/>', {
    class: 'notification-user-icon',
    src: from.image
  });
  let preview = $('<p></p>', { class: 'notification-user-content' });
  preview.html(`<strong>${from.name}</strong> has sent you a friend request`);

  let buttonsContainer = $('<div></div>');

  let accept = $('<div></div>', { class: 'button accept' });
  accept.text('Accept');
  accept.on('click', function() {
    console.log(from);
    acceptConnection(from._id);
    removeNotification();
  });

  let deny = $('<div></div>', { class: 'button deny' });
  deny.text('Deny');
  deny.on('click', function() {
    denyConnection(from._id);
    removeNotification();
  });

  let close = $('<div></div>', { class: 'button close' });
  close.text('X');
  close.on('click', function() {
    removeNotification();
  });

  buttonsContainer.append(accept);
  buttonsContainer.append(deny);

  notificationContainer.append(image);
  notificationContainer.append(preview);
  notificationContainer.append(buttonsContainer);
  notificationContainer.append(close);

  notificationContainer.css('display', 'flex');
  notificationContainer.animate({ opacity: 1, marginRight: 50 }, 500);
});

socket.on('push_message', function(msg) {
  if (window.location.href.indexOf('/messages') !== -1) {
    return;
  }
  console.log(`message notification from: ${msg.sender.name} `);

  notificationContainer.css('display', 'none');
  notificationContainer.css('opacity', '0');
  notificationContainer.css('margin-right', '0');
  notificationContainer.empty();

  let image = $('<img/>', {
    class: 'notification-user-icon',
    src: msg.sender.image
  });
  let previewContainer = $('<div></div>', {
    class: 'notification-user-content'
  });

  let message = msg.message;
  if (message.length >= 44) {
    message = `${message.substring(0, 40)}...`;
  }
  let preview = $('<p></p>');
  preview.html(`<strong>${msg.sender.name}</strong>: ${message}`);

  previewContainer.append(preview);

  let buttonsContainer = $('<div></div>', {
    class: 'notification-user-buttons'
  });

  let reply = $('<div></div>', { class: 'button reply' });
  reply.text('Reply');
  reply.on('click', function() {
    // Redirect to messages room with specific chat
    window.location.href = '/messages';
  });

  let close = $('<div></div>', { class: 'button close' });
  close.text('X');
  close.on('click', function() {
    removeNotification();
  });

  buttonsContainer.append(reply);

  notificationContainer.append(image);

  notificationContainer.append(previewContainer);
  notificationContainer.append(buttonsContainer);
  notificationContainer.append(close);

  notificationContainer.css('display', 'flex');
  notificationContainer.animate({ opacity: 1, marginRight: 50 }, 500);
});
