API_KEY = 'AIzaSyAp1-GKiZX19UcOZjRaTLlurgboIyS6UT8';

function updateMap() {
  var mapElement = document.getElementById('location-map');
  var address = document.getElementById('current').innerHTML;
  console.log(address);

  var map = new google.maps.Map(mapElement, {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    zoom: 11
  });

  var geocoder = new google.maps.Geocoder();

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

updateMap();

function takeSelfie() {
  var hiddenCanvas = document.querySelector('canvas'),
    video = document.getElementById('profile-picture'),
    width = video.videoWidth,
    height = video.videoHeight,
    context = hiddenCanvas.getContext('2d');

  hiddenCanvas.width = width;
  hiddenCanvas.height = height;

  context.drawImage(video, 0, 0, width, height);

  // Get image URL
  var imageDataURL = hiddenCanvas.toDataURL('image/png');
  return imageDataURL;
}

function addTag(value) {
  var newTag = document.createElement('span');
  newTag.className = 'tag';
  newTag.innerHTML = value + ' ';
  document.getElementById('add-tags').value = '';

  var removeTag = document.createElement('span');
  removeTag.className = 'button-submit remove-tag';
  removeTag.innerHTML = 'X';

  newTag.appendChild(removeTag);

  var parentT = document.getElementById('tags');

  parentT.appendChild(newTag);

  removeTag.onclick = function() {
    parentT.removeChild(newTag);
  };
}

function appendTag(event, input) {
  var code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    addTag(input.value);
  }
}

const editPhoto = document.getElementById('edit-profile-picture');
const editDescription = document.getElementById('edit-description');
const editEducation = document.getElementById('edit-education');
const editTags = document.getElementById('edit-tags');
const editLocation = document.getElementById('edit-location');

editPhoto.addEventListener('click', function(event) {
  // Multiple browser support
  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  // Replace <img> element with new <video> element
  var profilePicture = document.getElementById('profile-picture');

  var video = document.createElement('video');
  video.id = 'profile-picture';

  profilePicture.parentElement.replaceChild(video, profilePicture);

  // Replace "Edit Photo" with "Take Photo" and "Cancel"

  var cancel = document.createElement('div');
  cancel.className = 'button-submit';
  cancel.innerHTML = 'Cancel';

  var takePhoto = document.createElement('div');
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
    var imageURL = takeSelfie(); // returns new image URL

    // Buttons:
    // Replace "takePhoto" with new "usePhoto"
    var usePhoto = document.createElement('div');
    usePhoto.className = 'button-submit';
    usePhoto.innerHTML = 'Use Photo';

    takePhoto.parentElement.replaceChild(usePhoto, takePhoto);

    // Create new <img> element and preview it
    var newProfilePicture = document.createElement('img');
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

editDescription.addEventListener('click', function(event) {
  var parentDT = document.getElementById('description-text-container');
  var descriptionText = document.getElementById('description-text');
  var parentEC = document.getElementById('ec-description');

  if (descriptionText != null) {
    var text = descriptionText.innerHTML;

    var textArea = document.createElement('textarea');
    textArea.id = 'description-textarea';
    textArea.appendChild(document.createTextNode(text));

    var confirm = document.createElement('span');
    confirm.className = 'edit';
    confirm.appendChild(document.createTextNode('(Confirm)'));

    parentDT.replaceChild(textArea, descriptionText);
    parentEC.replaceChild(confirm, editDescription);

    confirm.addEventListener('click', function(event) {
      descriptionText.innerHTML = textArea.value;

      parentDT.replaceChild(descriptionText, textArea);
      parentEC.replaceChild(editDescription, confirm);
    });
  }
});

editEducation.addEventListener('click', function(event) {
  var parentEducation = document.getElementById('education');
  var parentEC = document.getElementById('ec-education');
  var school = document.getElementById('school');
  var major = document.getElementById('major');
  var minor = document.getElementById('minor');
  var gpa = document.getElementById('gpa');

  var editSchoolContainer = document.getElementById('edit-school');
  var editMajorContainer = document.getElementById('edit-major');
  var editMinorContainer = document.getElementById('edit-minor');
  var editGPAContainer = document.getElementById('edit-gpa');

  var editSchool = document.createElement('input');
  var editMajor = document.createElement('input');
  var editMinor = document.createElement('input');
  var editGPA = document.createElement('input');

  editSchool.setAttribute('value', school.innerHTML);
  editMajor.setAttribute('value', major.innerHTML);
  editMinor.setAttribute('value', minor.innerHTML);
  editGPA.setAttribute('value', gpa.innerHTML);

  editSchoolContainer.replaceChild(editSchool, school);
  editMajorContainer.replaceChild(editMajor, major);
  editMinorContainer.replaceChild(editMinor, minor);
  editGPAContainer.replaceChild(editGPA, gpa);

  var confirm = document.createElement('span');
  confirm.className = 'edit';
  confirm.appendChild(document.createTextNode('(Confirm)'));

  parentEC.replaceChild(confirm, editEducation);

  confirm.addEventListener('click', function(event) {
    school.innerHTML = editSchool.value;
    major.innerHTML = editMajor.value;
    minor.innerHTML = editMinor.value;
    gpa.innerHTML = editGPA.value;

    editSchoolContainer.replaceChild(school, editSchool);
    editMajorContainer.replaceChild(major, editMajor);
    editMinorContainer.replaceChild(minor, editMinor);
    editGPAContainer.replaceChild(gpa, editGPA);

    parentEC.replaceChild(editEducation, confirm);
  });
});

editTags.addEventListener('click', function(event) {
  var parentT = document.getElementById('tags');
  var parentEC = document.getElementById('ec-tags');

  var addTags = document.createElement('input');
  addTags.id = 'add-tags';
  addTags.setAttribute('onKeyPress', 'appendTag(event, this)');

  var add = document.createElement('span');
  add.id = 'add';
  add.className = 'button-submit';
  add.appendChild(document.createTextNode('+'));

  parentEC.insertAdjacentElement('afterend', addTags);
  addTags.insertAdjacentElement('afterend', add);

  var confirm = document.createElement('span');
  confirm.className = 'edit';
  confirm.appendChild(document.createTextNode('(Confirm)'));

  parentEC.replaceChild(confirm, editTags);

  add.addEventListener('click', function(event) {
    addTag(addTags.value);
  });

  confirm.addEventListener('click', function(event) {
    parentT.removeChild(add);
    parentT.removeChild(addTags);
    parentEC.replaceChild(editTags, confirm);
  });
});

editLocation.addEventListener('click', function(event) {
  var parentLocation = document.getElementById('location');
  var parentEC = document.getElementById('ec-location');
  var current = document.getElementById('current');

  var editCurrentContainer = document.getElementById('edit-current');

  var editCurrent = document.createElement('input');

  editCurrent.setAttribute('value', current.innerHTML);

  editCurrentContainer.replaceChild(editCurrent, current);

  var confirm = document.createElement('span');
  confirm.className = 'edit';
  confirm.appendChild(document.createTextNode('(Confirm)'));

  parentEC.replaceChild(confirm, editLocation);

  confirm.addEventListener('click', function(event) {
    current.innerHTML = editCurrent.value;

    editCurrentContainer.replaceChild(current, editCurrent);

    parentEC.replaceChild(editLocation, confirm);

    updateMap();
  });
});
