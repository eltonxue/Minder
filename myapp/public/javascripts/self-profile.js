// **********************
// *** INITIALIZATION ***
// **********************

const API_KEY = 'AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8';
const USER_BASE_URL = 'http://localhost:3000/user/';
const BASE_URL = 'http://localhost:3000/users';

// Current User -> Elton Xue
// Gather all data necessary and display it on the screen

// currentUser = user data that is currently in session
const sessionID = currentUser._id;

function updateUserInfo(data) {
  $.ajax({
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE'
    },
    url: USER_BASE_URL + sessionID,
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

function getUserInfo() {
  $('#name').text(currentUser.name);
  $('#description-text').text(currentUser.description);
  $('#school').text(currentUser.school);
  $('#major').text(currentUser.major);
  $('#minor').text(currentUser.minor);
  $('#gpa').text(currentUser.gpa);

  // Handle displaying tags
  var split = currentUser.tags.split(',');
  for (let i = 0; i < split.length; ++i) {
    if (split[i] != '') {
      displayTag(split[i]);
    }
  }

  $('#current').text(currentUser.location);
  updateMap(); // Updates the initial map on the screen
}

getUserInfo(); // Gathers data from API through AJAX GET call and displays it on the page

// ************************
// *** HELPER FUNCTIONS ***
// ************************

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
  let imageDataURL = hiddenCanvas.toDataURL('image/png');
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
    $.get(USER_BASE_URL + sessionID, function(data, status) {
      if (data.tags == '') {
        updateUserInfo({ tags: value });
      } else {
        updateUserInfo({ tags: data.tags + ',' + value });
      }
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
  $.get(USER_BASE_URL + sessionID, function(data, status) {
    console.log(data);
    let tags = data.tags.split(',');
    let index = tags.indexOf(value);
    if (index > -1) {
      // -1 means that the value does not exist in the array
      tags.splice(index, 1);
    }

    let updatedTags = tags.join(',');
    console.log(updatedTags);
    updateUserInfo({ tags: updatedTags });
  });
}

const editPhoto = document.getElementById('edit-profile-picture');
const editDescription = $('#edit-description');
const editEducation = $('#edit-education');
const editTags = $('#edit-tags');
const editLocation = $('#edit-location');

// ***********************
// *** EVENT LISTENERS ***
// ***********************

editPhoto.addEventListener('click', function(event) {
  // Multiple browser support
  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  // Replace <img> element with new <video> element
  let profilePicture = document.getElementById('profile-picture');

  let video = document.createElement('video');
  video.id = 'profile-picture';

  profilePicture.parentElement.replaceChild(video, profilePicture);

  // Replace "Edit Photo" with "Take Photo" and "Cancel"

  let cancel = document.createElement('div');
  cancel.className = 'button-submit';
  cancel.innerHTML = 'Cancel';

  let takePhoto = document.createElement('div');
  takePhoto.className = 'button-submit';
  takePhoto.innerHTML = 'Take Photo';

  editPhoto.parentElement.replaceChild(takePhoto, editPhoto);
  takePhoto.insertAdjacentElement('afterend', cancel);

  navigator.getUserMedia(
    {
      video: true
    },
    function(stream) {
      video.src = window.URL.createObjectURL(stream);

      video.play();
    },
    function(err) {
      console.error(err);
    }
  );

  // Take photo

  takePhoto.onclick = function() {
    let imageURL = takeSelfie(); // returns new image URL

    // Buttons:
    // Replace "takePhoto" with new "usePhoto"
    let usePhoto = document.createElement('div');
    usePhoto.className = 'button-submit';
    usePhoto.innerHTML = 'Use Photo';

    takePhoto.parentElement.replaceChild(usePhoto, takePhoto);

    // Create new <img> element and preview it
    let newProfilePicture = document.createElement('img');
    newProfilePicture.id = 'profile-picture';

    newProfilePicture.setAttribute('src', imageURL);

    video.parentElement.replaceChild(newProfilePicture, video);

    // Handle "Use Photo" onclick

    usePhoto.onclick = function() {
      // Remove and replace buttons
      usePhoto.parentElement.removeChild(cancel);
      usePhoto.parentElement.replaceChild(editPhoto, usePhoto);
    };

    // Handle 'Cancel' onclick
    cancel.onclick = function() {
      // Replace <video> element with old <img> element w/o changed src
      newProfilePicture.parentElement.replaceChild(
        profilePicture,
        newProfilePicture
      );

      // Remove and replace buttons
      usePhoto.parentElement.removeChild(cancel);
      usePhoto.parentElement.replaceChild(editPhoto, usePhoto);
    };
  };

  // Cancel photo editting
  cancel.onclick = function() {
    // Replace <video> element with old <img> element w/o changed src
    video.parentElement.replaceChild(profilePicture, video);

    // Remove and replace buttons
    takePhoto.parentElement.removeChild(cancel);
    takePhoto.parentElement.replaceChild(editPhoto, takePhoto);
  };

  // Store photo
  // Replace image src with new photo
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
    current.text(editCurrent.val());

    editCurrent.replaceWith(current);
    confirm.replaceWith(editLocation);

    updateUserInfo({ location: current.text() });

    updateMap();
  });
});
