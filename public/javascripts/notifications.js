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

var socket = io.connect();
const notificationContainer = $('#notification-container');

socket.on('push', function(from, otherUser) {
  $.get('/user', function(sessionUser, status) {
    if (sessionUser._id == otherUser._id) {
      console.log(`current session user: ${sessionUser.name} `);
      console.log(`push notification from: ${from.name} `);
      console.log(`push the notification for: ${otherUser.name}`);

      // Create development

      notificationContainer.css('display', 'none');
      notificationContainer.css('opacity', '0');
      notificationContainer.css('margin-right', '0');
      notificationContainer.empty();

      let image = $('<img/>', {
        class: 'notification-user-icon',
        src: from.image
      });
      let preview = $('<p></p>', { class: 'notification-user-name' });
      preview.html(
        `<strong>${from.name}</strong> has sent you a friend request`
      );

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
    }
  });
});
