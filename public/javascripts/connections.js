// LOADING INITIAL SUGGESTIONS

function acceptRequest(profile) {
  const otherUserID = profile.data('id');
  const connectionsContainer = $('#your-connections-container');

  $.get('/user', function(sessionUser, status) {
    const sessionUserID = sessionUser._id;

    // Add to session user's connections
    let newConnections = sessionUser.connections;
    newConnections.push(otherUserID);

    // Delete from session user's requests
    let newPendingRequests = sessionUser.pendingRequests;
    console.log(newPendingRequests);
    newPendingRequests.splice(newPendingRequests.indexOf(otherUserID), 1);
    console.log(newPendingRequests);

    $.ajax({
      url: '/user',
      type: 'PATCH',
      data: JSON.stringify({
        connections: newConnections,
        pendingRequests: newPendingRequests
      }),
      contentType: 'application/json'
    });

    $.get(`/user/${otherUserID}`, function(otherUser, status) {
      // Add to other user's connections
      let otherNewConnections = otherUser.connections;
      otherNewConnections.push(sessionUserID);

      // Delete from other user's invites
      let otherNewPendingInvites = otherUser.pendingInvites;
      otherNewPendingInvites.splice(
        otherNewPendingInvites.indexOf(sessionUserID),
        1
      );

      $.ajax({
        url: `/user/${otherUserID}`,
        type: 'PATCH',
        data: JSON.stringify({
          connections: otherNewConnections,
          pendingInvites: otherNewPendingInvites
        }),
        contentType: 'application/json',
        success: function(response, textStatus, jqXhr) {
          console.log('Successful Patch!');
          console.log(response);
        }
      });

      let newProfile = createProfileLink(otherUser);

      connectionsContainer.append(newProfile);
    });

    let yourConnectionsHeader = connectionsContainer.prev();
    yourConnectionsHeader.text(`Your Connections (${newConnections.length})`);

    let pendingRequestsHeader = $('#pending-requests-container').prev();
    pendingRequestsHeader.text(
      `Pending Requests (${newPendingRequests.length})`
    );
  });

  // Delete from DOM
  profile.remove();
}

function denyRequest(profile) {
  const otherUserID = profile.data('id');
  $.get('/user', function(sessionUser, status) {
    const sessionUserID = sessionUser._id;
    // Delete from session user's requests
    let newPendingRequests = sessionUser.pendingRequests;
    newPendingRequests.splice(newPendingRequests.indexOf(otherUserID), 1);

    $.ajax({
      url: '/user',
      type: 'PATCH',
      data: JSON.stringify({ pendingRequests: newPendingRequests }),
      contentType: 'application/json'
    });

    $.get(`/user/${otherUserID}`, function(otherUser, status) {
      // Delete from other user's invites
      let otherNewPendingInvites = otherUser.pendingInvites;
      otherNewPendingInvites.splice(
        otherNewPendingInvites.indexOf(sessionUserID),
        1
      );

      $.ajax({
        url: `/user/${otherUserID}`,
        type: 'PATCH',
        data: JSON.stringify({
          pendingInvites: otherNewPendingInvites
        }),
        contentType: 'application/json'
      });
    });
    let pendingRequestsHeader = $('#pending-requests-container').prev();
    pendingRequestsHeader.text(
      `Pending Requests (${newPendingRequests.length})`
    );
  });

  // Delete from DOM
  profile.remove();
}

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

function createRequestProfile(user) {
  let profile = createProfile(user);
  profile.attr('class', 'profile pending pending-invite');
  let accept = $('<div></div>', { class: 'button accept' });
  accept.text('Accept');
  profile.append(accept);
  let deny = $('<div></div>', { class: 'button deny' });
  deny.text('Deny');
  profile.append(deny);

  return profile;
}

function createInviteProfile(user) {
  let profile = createProfile(user);
  profile.attr('class', 'profile pending pending-request');
  let cancel = $('<div></div>', { class: 'button cancel' });
  cancel.text('Cancel');
  profile.append(cancel);

  return profile;
}

function createProfileLink(user) {
  let profile = createProfile(user);
  profile.on('click', function() {
    window.location.href = `profile-${user._id}`;
  });

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
    const { userConnections, pendingRequests, pendingInvites } = connections;
    for (let i = 0; i < userConnections.length; ++i) {
      let profile = createProfileLink(userConnections[i]);
      $('#your-connections-container').append(profile);
    }
    for (let i = 0; i < pendingRequests.length; ++i) {
      let profile = createRequestProfile(pendingRequests[i]);
      console.log(pendingRequests);
      $('#pending-requests-container').append(profile);
    }
    for (let i = 0; i < pendingInvites.length; ++i) {
      let profile = createInviteProfile(pendingInvites[i]);
      $('#pending-invites-container').append(profile);
    }
  });
}

displayProfiles();

$('#pending-requests-container').on('click', '.accept', function(event) {
  acceptRequest($(this).parent());
});

$('#pending-requests-container').on('click', '.deny', function(event) {
  denyRequest($(this).parent());
});

$('#pending-invites-container').on('click', '.cancel', function(event) {
  cancelInvite($(this).parent());
});
