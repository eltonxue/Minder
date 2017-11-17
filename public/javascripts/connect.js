function cancelInvite(profile) {
  const otherUserID = profile.data('id');

  $.ajax({
    url: '/action/cancel',
    type: 'PATCH',
    data: JSON.stringify({
      id: otherUserID
    }),
    contentType: 'application/json',
    success: function(otherUser, textStatus, jqXhr) {
      console.log('Successful Patch!');
      console.log(otherUser);

      profile.remove();

      const invitesContainer = $('#pending-invites-container');

      let pendingInvitesHeader = invitesContainer.prev();
      pendingInvitesHeader.text(
        `Pending Invites (${invitesContainer.children().length})`
      );
    }
  });
}

function createInviteProfile(user) {
  let profile = createProfile(user);
  profile.attr('class', 'profile pending pending-request');
  let cancel = $('<div></div>', { class: 'button cancel' });
  cancel.text('Cancel');
  profile.append(cancel);

  return profile;
}

function createProfile(user) {
  let profile = $('<div></div>', { class: 'profile' });
  profile.attr('data-id', user._id);

  let image = $('<img>');
  image.attr('src', user.image);
  image.attr('class', 'profile-image');
  let name = $('<p></p>');
  name.text(user.name);
  name.css('font-weight', 'bold');

  profile.append(image);
  profile.append(name);

  return profile;
}

function displayProfiles() {
  $.get(`/user/connections`, function(connections, status) {
    const { pendingInvites } = connections;
    for (let i = 0; i < pendingInvites.length; ++i) {
      let profile = createInviteProfile(pendingInvites[i]);
      $('#pending-invites-container').append(profile);
    }
  });
}

function sendInvite(id) {
  const otherUserID = id;

  $.get('/user', function(sessionUser, status) {
    $.ajax({
      url: '/action/send',
      type: 'PATCH',
      data: JSON.stringify({
        id: otherUserID
      }),
      contentType: 'application/json',
      success: function(otherUser, textStatus, jqXhr) {
        console.log('Successful Patch!');
        console.log(otherUser);

        socket.emit('confirm', sessionUser, otherUser);

        window.location.href = 'connections';
      }
    });
  });
}

displayProfiles();

const pendingInvitesContainer = $('#pending-invites-container');
const backButton = $('#back');
const connectButton = $('#connect');
const otherUserID = $('#button-container').data('id');

pendingInvitesContainer.on('click', '.cancel', function(event) {
  cancelInvite($(this).parent());
});

pendingInvitesContainer.on('click', '.profile-image', function(event) {
  window.location.href = `profile-${$(this).parent().data('id')}`;
});

backButton.on('click', function(event) {
  window.location.href = `profile-${otherUserID}`;
});

connectButton.on('click', function(event) {
  backButton.remove();
  connectButton.remove();

  let confirmation = $('<h2></h2>', { id: 'confirmation' });
  confirmation.text('Invite Successfully Sent!');

  $('#button-container').append(confirmation);

  sendInvite(otherUserID);
});
