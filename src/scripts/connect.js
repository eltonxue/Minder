document.getElementById('back').onclick = function() {
  window.location.href = 'user-profile.html';
};

document.getElementById('invite').onclick = function() {
  window.location.href = 'discovery.html';
};

var cancelInvites = document.getElementsByClassName('cancel-invite');

for (var i = 0; i < cancelInvites.length; ++i) {
  console.log(cancelInvites[i]);
  cancelInvites[i].onclick = function() {
    var toDelete = this.parentElement.parentElement;
    toDelete.parentElement.removeChild(toDelete);
  };
}
