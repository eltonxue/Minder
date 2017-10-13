document.getElementById('discover').onclick = function() {
  window.location.href = 'discovery.html';
};

const editDescription = document.getElementById('edit-description');
const editEducation = document.getElementById('edit-education');
const editTags = document.getElementById('edit-tags');
const editLocation = document.getElementById('edit-location');

editDescription.addEventListener('click', function(event) {
  var element = document.getElementById('description-text');
  if (element != null) {
    var text = element.innerHTML;

    var textArea = document.createElement('textarea');
    textArea.id = 'description-textarea';
    textArea.appendChild(document.createTextNode(text));

    editDescription.replaceChild(textArea, element);
  }
});

editEducation.addEventListener('click', function(event) {});

editTags.addEventListener('click', function(event) {});

editLocation.addEventListener('click', function(event) {});
