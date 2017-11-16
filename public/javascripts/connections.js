// LOADING INITIAL SUGGESTIONS

const connectionsContainer = $('#your-connections-container');
const requestsContainer = $('#pending-requests-container');
const invitesContainer = $('#pending-invites-container');

function acceptRequest(profile) {
  const otherUserID = profile.data('id');

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

      let newProfile = createProfile(otherUser);
      connectionsContainer.append(newProfile);

      profile.remove();

      let yourConnectionsHeader = connectionsContainer.prev();
      yourConnectionsHeader.text(
        `Your Connections (${connectionsContainer.children().length})`
      );

      let pendingRequestsHeader = requestsContainer.prev();
      pendingRequestsHeader.text(
        `Pending Requests (${requestsContainer.children().length})`
      );
    }
  });
}

function denyRequest(profile) {
  const otherUserID = profile.data('id');

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

      profile.remove();

      let pendingRequestsHeader = requestsContainer.prev();
      pendingRequestsHeader.text(
        `Pending Requests (${requestsContainer.children().length})`
      );
    }
  });
}

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

      let pendingInvitesHeader = invitesContainer.prev();
      pendingInvitesHeader.text(
        `Pending Invites (${invitesContainer.children().length})`
      );
    }
  });
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
      let profile = createProfile(userConnections[i]);
      $('#your-connections-container').append(profile);
    }
    for (let i = 0; i < pendingRequests.length; ++i) {
      let profile = createRequestProfile(pendingRequests[i]);
      $('#pending-requests-container').append(profile);
    }
    for (let i = 0; i < pendingInvites.length; ++i) {
      let profile = createInviteProfile(pendingInvites[i]);
      $('#pending-invites-container').append(profile);
    }
  });
}

displayProfiles();

const yourConnectionsContainer = $('#your-connections-container');
const pendingRequestsContainer = $('#pending-requests-container');
const pendingInvitesContainer = $('#pending-invites-container');

pendingRequestsContainer.on('click', '.accept', function(event) {
  acceptRequest($(this).parent());
});

pendingRequestsContainer.on('click', '.deny', function(event) {
  denyRequest($(this).parent());
});

pendingInvitesContainer.on('click', '.cancel', function(event) {
  cancelInvite($(this).parent());
});

yourConnectionsContainer.on('click', '.profile-image', function(event) {
  window.location.href = `profile-${$(this).parent().data('id')}`;
});

pendingRequestsContainer.on('click', '.profile-image', function(event) {
  window.location.href = `profile-${$(this).parent().data('id')}`;
});

pendingInvitesContainer.on('click', '.profile-image', function(event) {
  window.location.href = `profile-${$(this).parent().data('id')}`;
});
