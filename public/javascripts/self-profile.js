// **********************
// *** INITIALIZATION ***
// **********************

const API_KEY = 'AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8';
const SESSION_USER_BASE_URL = '/user';

// Current User -> Elton Xue
// Gather all data necessary and display it on the screen

// currentUser = user data that is currently in session
// const sessionID = currentUser._id;

function updateUserInfo(data) {
  $.ajax({
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE'
    },
    url: SESSION_USER_BASE_URL,
    type: 'PATCH',
    data: data,
    success: function(response, textStatus, jqXhr) {
      console.log('Patch has been successful!');
      console.log('Response: ' + response);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // log the error to the console
      console.log('Patch has failed. ERROR: ' + textStatus, errorThrown);
    },
    complete: function() {
      console.log('Patching finished');
    }
  });
}

updateMap();

// ************************
// *** HELPER FUNCTIONS ***
// ************************

function updateMap() {
  $.get(SESSION_USER_BASE_URL, function(data, status) {
    let mapElement = document.getElementById('location-map');
    const address = data.location.name;

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
  });
}

function takeSelfie() {
  let hiddenCanvas = document.querySelector('canvas'),
    video = document.getElementById('profile-picture'),
    width = video.videoWidth,
    height = video.videoHeight,
    context = hiddenCanvas.getContext('2d');

  hiddenCanvas.width = width;
  hiddenCanvas.height = height;

  context.drawImage(video, 0, 0, width, height);

  // Get image URL
  let imageDataURL = hiddenCanvas.toDataURL();
  return imageDataURL;
}

function displayTag(value) {
  let newTag = $('<span></span>', { class: 'tag' });
  newTag.text(value + ' ');

  let removeTag = $('<span></span>', { class: 'button-submit remove-tag' });
  removeTag.text('X');

  newTag.append(removeTag);

  $('#tags').append(newTag);
}

function addTag(value) {
  if (value != '') {
    displayTag(value);
    console.log(value);
    $.get(SESSION_USER_BASE_URL, function(data, status) {
      let newTags = data.tags;
      newTags.push(value);
      updateUserInfo({ tags: newTags });
    });
  }
}

function appendTag(event, input) {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    addTag(input.value);
    $('#add-tags').val('');
  }
}

function removeTag(value) {
  $.get(SESSION_USER_BASE_URL, function(data, status) {
    console.log(data);
    let tags = data.tags;
    let index = tags.indexOf(value);
    if (index > -1) {
      // -1 means that the value does not exist in the array
      tags.splice(index, 1);
    }

    console.log(tags);
    updateUserInfo({ tags: tags });
  });
}

// const editPhoto = document.getElementById('edit-profile-picture');
const editPhoto = $('#edit-profile-picture');
const editDescription = $('#edit-description');
const editEducation = $('#edit-education');
const editTags = $('#edit-tags');
const editLocation = $('#edit-location');

// ***********************
// *** EVENT LISTENERS ***
// ***********************

$(
  '#edit-profile-picture-container'
).on('click', '#edit-profile-picture', function(event) {
  // Multiple browser support
  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  // Replace <img> element with new <video> element
  let profilePicture = $('#profile-picture');

  let video = $('<video></video>', { id: 'profile-picture' });

  profilePicture.replaceWith(video);

  // Replace "Edit Photo" with "Take Photo" and "Cancel"

  let cancel = $('<div></div>', { class: 'button-submit' });
  cancel.text('Cancel');

  let takePhoto = $('<div></div>', { class: 'button-submit' });
  takePhoto.text('Take Photo');

  editPhoto.replaceWith(takePhoto);
  takePhoto.after(cancel);

  navigator.getUserMedia(
    {
      video: true
    },
    function(stream) {
      video.attr('src', window.URL.createObjectURL(stream));

      video.get(0).play(); // jQuery equivalent of .play()
    },
    function(err) {
      console.error(err);
    }
  );

  // Take photo

  takePhoto.on('click', function(event) {
    let imageURL = takeSelfie(); // returns new image URL

    // Buttons:
    // Replace "takePhoto" with new "usePhoto"
    let usePhoto = $('<div></div>', { class: 'button-submit' });
    usePhoto.text('Use Photo');

    takePhoto.replaceWith(usePhoto);

    // Create new <img> element and PREVIEW IT
    let newProfilePicture = $('<img></img>', {
      id: 'profile-picture',
      src: imageURL
    });

    video.replaceWith(newProfilePicture);

    // Handle "Use Photo" onclick
    usePhoto.on('click', function(event) {
      // Patches image URL into the API
      let base64data = imageURL.split(',')[1];

      updateUserInfo({ image: base64data });

      // Remove and replace buttons
      cancel.remove();
      usePhoto.replaceWith(editPhoto);
    });

    // Handle 'Cancel' onclick
    cancel.on('click', function(event) {
      // Replace <video> element with old <img> element w/o changed src
      newProfilePicture.replaceWith(profilePicture);

      // Remove and replace buttons
      cancel.remove();
      usePhoto.replaceWith(editPhoto);
    });
  });

  // Cancel photo editting
  cancel.on('click', function(event) {
    // Replace <video> element with old <img> element w/o changed src
    video.replaceWith(profilePicture);

    // Remove and replace buttons
    cancel.remove();
    takePhoto.replaceWith(editPhoto);
  });
});

$('#edit-description-container').on('click', '#edit-description', function(
  event
) {
  let descriptionText = $('#description-text');

  if (descriptionText != null) {
    let text = descriptionText.text();

    let textArea = $('<textarea></textarea>', { id: 'description-textarea' });
    textArea.val(text);

    let confirm = $('<span></span>', { class: 'edit' });
    confirm.text('(Confirm)');

    descriptionText.replaceWith(textArea);
    editDescription.replaceWith(confirm);

    confirm.on('click', function(event) {
      confirm.replaceWith(editDescription);

      descriptionText.text(textArea.val());
      textArea.replaceWith(descriptionText);

      updateUserInfo({ description: textArea.val() });
    });
  }
});

$('#edit-education-container').on('click', '#edit-education', function(event) {
  let school = $('#school');
  let major = $('#major');
  let minor = $('#minor');
  let gpa = $('#gpa');

  let editSchoolContainer = $('#edit-school');
  let editMajorContainer = $('#edit-major');
  let editMinorContainer = $('#edit-minor');
  let editGPAContainer = $('#edit-gpa');

  let editSchool = $('<input></input>', { value: school.text() });
  let editMajor = $('<input></input>', { value: major.text() });
  let editMinor = $('<input></input>', { value: minor.text() });
  let editGPA = $('<input></input>', { value: gpa.text() });

  school.replaceWith(editSchool);
  major.replaceWith(editMajor);
  minor.replaceWith(editMinor);
  gpa.replaceWith(editGPA);

  let confirm = $('<span></span>', { class: 'edit' });
  confirm.text('(Confirm)');

  editEducation.replaceWith(confirm);

  confirm.on('click', function(event) {
    school.text(editSchool.val());
    major.text(editMajor.val());
    minor.text(editMinor.val());
    gpa.text(editGPA.val());

    editSchool.replaceWith(school);
    editMajor.replaceWith(major);
    editMinor.replaceWith(minor);
    editGPA.replaceWith(gpa);

    confirm.replaceWith(editEducation);

    updateUserInfo({
      school: school.text(),
      major: major.text(),
      minor: minor.text(),
      gpa: gpa.text()
    });
  });
});

$('#tags').on('click', '.remove-tag', function(event) {
  let parent = $(this).parent();
  $(this).remove();
  removeTag(parent.text().trim());
  parent.remove();
});

$('#edit-tags-container').on('click', '#edit-tags', function(event) {
  let addTags = $('<input></input>', {
    id: 'add-tags',
    onKeyPress: 'appendTag(event, this)'
  });

  let add = $('<span></span>', { id: 'add', class: 'button-submit' });
  add.text('+');

  addTags.insertAfter($('#edit-tags-container'));
  add.insertAfter(addTags);

  let confirm = $('<span></span>', { class: 'edit' });
  confirm.text('(Confirm)');

  editTags.replaceWith(confirm);

  confirm.on('click', function(event) {
    confirm.replaceWith(editTags);

    add.remove();
    addTags.remove();
  });

  add.on('click', function(event) {
    addTag(addTags.val());
    addTags.val('');
  });
});

$('#edit-location-container').on('click', '#edit-location', function(event) {
  let current = $('#current');

  let editCurrentContainer = $('#edit-current');

  let editCurrent = $('<input></input>', { value: current.text() });

  let confirm = $('<span></span>', { class: 'edit' });
  confirm.text('(Confirm)');

  current.replaceWith(editCurrent);
  editLocation.replaceWith(confirm);

  confirm.on('click', function(event) {
    $.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${editCurrent.val()}&key=AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8`
    ).then(function(resp) {
      var geoResult = resp.results[0];
      var realLocationName = geoResult.formatted_address;
      var coords = geoResult.geometry.location;

      var data = {
        location: {
          name: realLocationName,
          geo: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          }
        }
      };

      $.ajax({
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE'
        },
        url: SESSION_USER_BASE_URL,
        type: 'PATCH',
        data: data,
        success: function(response, textStatus, jqXhr) {
          console.log('Patch has been successful!');
          console.log('Response: ' + response);

          editCurrent.replaceWith(current);
          confirm.replaceWith(editLocation);

          current.text(realLocationName);

          updateMap();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // log the error to the console
          console.log('Patch has failed. ERROR: ' + textStatus, errorThrown);
        },
        complete: function() {
          console.log('Patching finished');
        }
      });
    });
  });
});
