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
  console.log(address);

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

$('#connect').on('click', function() {
  window.location.href = 'connect';
});

$('.container').on('click', '.profile', function(event) {
  const userID = $(this).data('id');
  window.location.href = `profile-${userID}`;
});
