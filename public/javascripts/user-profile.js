// **********************
// *** INITIALIZATION ***
// **********************

API_KEY = 'AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8';

updateMap(); // Updates the initial map on the screen

// ***************
// *** DIVIDER ***
// ***************

function updateMap() {
  let mapElement = document.getElementById('location-map');
  let address = document.getElementById('current').innerHTML;

  let map = new google.maps.Map(mapElement, {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    zoom: 11
  });

  let geocoder = new google.maps.Geocoder();

  geocoder.geocode(
    {
      address: address
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        new google.maps.Marker({
          position: results[0].geometry.location,
          map: map
        });
        map.setCenter(results[0].geometry.location);
      }
    }
  );
}

function removeConnection(id) {
  const otherUserID = id;

  $.ajax({
    url: '/action/remove',
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

function cancelConnection(id) {
  const otherUserID = id;

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
    }
  });
}

$('#button-container').on('click', '#connect', function() {
  window.location.href = `connect-${$(this).data('id')}`;
});

$('#button-container').on('click', '#remove', function() {
  const id = $(this).data('id');
  removeConnection(id);
  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  $('#button-container').append(connectButton);
  $(this).remove();
});

$('#button-container').on('click', '#accept', function() {
  const id = $(this).data('id');
  acceptConnection(id);
  let removeButton = $('<div></div>', { id: 'remove', class: 'button-submit' });
  removeButton.attr('data-id', id);
  $('#button-container').append(removeButton);
  removeButton.text('Remove Connection');
  $(this).next().remove();
  $(this).remove();
});

$('#button-container').on('click', '#deny', function() {
  const id = $(this).data('id');
  denyConnection(id);

  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  $('#button-container').append(connectButton);
  $(this).prev().remove();
  $(this).remove();
});

$('#button-container').on('click', '#cancel', function() {
  const id = $(this).data('id');
  cancelConnection(id);

  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  $('#button-container').append(connectButton);
  $(this).prev().remove();
  $(this).remove();
});

$('.container').on('click', '.profile', function(event) {
  window.location.href = `profile-${$(this).data('id')}`;
});
