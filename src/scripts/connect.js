document.getElementById('back').onclick = function() {
  window.location.href = 'user-profile.html';
};

document.getElementById('invite').onclick = function() {
  window.location.href = 'discovery.html';
};

let cancelInvites = document.getElementsByClassName('cancel-invite');

for (let i = 0; i < cancelInvites.length; ++i) {
  console.log(cancelInvites[i]);
  cancelInvites[i].onclick = function() {
    let toDelete = this.parentElement.parentElement;
    toDelete.parentElement.removeChild(toDelete);
  };
}

let profiles = document.querySelectorAll('.profile');

let redirect = function() {
  window.location.href = 'user-profile.html';
};

for (let i = 0; i < profiles.length; ++i) {
  profiles[i].onclick = function() {
    redirect();
  };
}
