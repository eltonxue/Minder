// **********************
// *** INITIALIZATION ***
// **********************

API_KEY = 'AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8';

updateMap();

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
    contentType: 'application/json'
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
    contentType: 'application/json'
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
    contentType: 'application/json'
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
    contentType: 'application/json'
  });
}

$('.container').on('click', '.profile', function(event) {
  window.location.href = `profile-${$(this).data('id')}`;
});

const buttonContainer = $('#button-container');

buttonContainer.on('click', '#connect', function() {
  window.location.href = `connect-${$(this).data('id')}`;
});

buttonContainer.on('click', '#remove', function() {
  const id = $(this).data('id');
  removeConnection(id);
  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  buttonContainer.append(connectButton);
  $(this).remove();
});

buttonContainer.on('click', '#accept', function() {
  const id = $(this).data('id');
  acceptConnection(id);
  let removeButton = $('<div></div>', { id: 'remove', class: 'button-submit' });
  removeButton.attr('data-id', id);
  buttonContainer.append(removeButton);
  removeButton.text('Remove Connection');
  $(this).next().remove();
  $(this).remove();
});

buttonContainer.on('click', '#deny', function() {
  const id = $(this).data('id');
  denyConnection(id);

  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  buttonContainer.append(connectButton);
  $(this).prev().remove();
  $(this).remove();
});

buttonContainer.on('click', '#cancel', function() {
  const id = $(this).data('id');
  cancelConnection(id);

  let connectButton = $('<div></div>', {
    id: 'connect',
    class: 'button-submit'
  });
  connectButton.attr('data-id', id);
  connectButton.text('Connect');
  buttonContainer.append(connectButton);
  $(this).prev().remove();
  $(this).remove();
});
