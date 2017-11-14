function cancelInvite(profile) {
  const otherUserID = profile.data('id');
  $.get('/user', function(sessionUser, status) {
    const sessionUserID = sessionUser._id;

    // Delete from session user's invites
    let newPendingInvites = sessionUser.pendingInvites;
    newPendingInvites.splice(newPendingInvites.indexOf(otherUserID), 1);

    $.ajax({
      url: '/user',
      type: 'PATCH',
      data: JSON.stringify({ pendingInvites: newPendingInvites }),
      contentType: 'application/json'
    });

    $.get(`/user/${otherUserID}`, function(otherUser, status) {
      // Delete from other user's requests
      let otherNewPendingRequests = otherUser.pendingRequests;
      otherNewPendingRequests.splice(
        otherNewPendingRequests.indexOf(sessionUserID),
        1
      );

      $.ajax({
        url: `/user/${otherUserID}`,
        type: 'PATCH',
        data: JSON.stringify({
          pendingRequests: otherNewPendingRequests
        }),
        contentType: 'application/json'
      });
    });
    let pendingInvitesHeader = $('#pending-invites-container').prev();
    pendingInvitesHeader.text(`Pending Requests (${newPendingInvites.length})`);
  });
  // Delete from DOM
  profile.remove();
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

function sendInvite() {
  // Add user to session user's 'pending invites'
  $.get('/user', function(sessionUser, status) {
    const sessionUserID = sessionUser._id;

    // Add user to session user's 'pending invites'
    let newPendingInvites = sessionUser.pendingInvites;
    newPendingInvites.push(otherUserID);

    $.ajax({
      url: '/user',
      type: 'PATCH',
      data: { pendingInvites: newPendingInvites }
    });

    $.get(`/user/${otherUserID}`, function(otherUser, status) {
      // Add session user to other user's 'pending requests'
      let newPendingRequests = otherUser.pendingRequests;
      newPendingRequests.push(sessionUserID);

      $.ajax({
        url: `/user/${otherUserID}`,
        type: 'PATCH',
        data: { pendingRequests: newPendingRequests },
        success: function(response, textStatus, jqXhr) {
          // Redirect to connections page
          setTimeout(function() {
            window.location.href = 'connections';
          }, 500);
        }
      });
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

  sendInvite();
});
