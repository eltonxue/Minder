document.getElementById('discover').onclick = function() {
  window.location.href = 'discovery.html';
};

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

const editDescription = document.getElementById('edit-description');
const editEducation = document.getElementById('edit-education');
const editTags = document.getElementById('edit-tags');
const editLocation = document.getElementById('edit-location');

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
  var hometown = document.getElementById('hometown');
  var past = document.getElementById('past');
  var current = document.getElementById('current');

  var editHometownContainer = document.getElementById('edit-hometown');
  var editPastContainer = document.getElementById('edit-past');
  var editCurrentContainer = document.getElementById('edit-current');

  var editHometown = document.createElement('input');
  var editPast = document.createElement('input');
  var editCurrent = document.createElement('input');

  editHometown.setAttribute('value', hometown.innerHTML);
  editPast.setAttribute('value', past.innerHTML);
  editCurrent.setAttribute('value', current.innerHTML);

  editHometownContainer.replaceChild(editHometown, hometown);
  editPastContainer.replaceChild(editPast, past);
  editCurrentContainer.replaceChild(editCurrent, current);

  var confirm = document.createElement('span');
  confirm.className = 'edit';
  confirm.appendChild(document.createTextNode('(Confirm)'));

  parentEC.replaceChild(confirm, editLocation);

  confirm.addEventListener('click', function(event) {
    hometown.innerHTML = editHometown.value;
    past.innerHTML = editPast.value;
    current.innerHTML = editCurrent.value;

    editHometownContainer.replaceChild(hometown, editHometown);
    editPastContainer.replaceChild(past, editPast);
    editCurrentContainer.replaceChild(current, editCurrent);

    parentEC.replaceChild(editLocation, confirm);
  });
});
