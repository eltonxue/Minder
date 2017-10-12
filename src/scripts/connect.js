var profiles = document.querySelectorAll('.profile');

var redirect = function() {
  window.location.href = 'user-profile.html';
};

for (var i = 0; i < profiles.length; ++i) {
  profiles[i].onclick = function() {
    redirect();
  };
}

document.getElementById('back').onclick = function() {
  window.location.href = 'user-profile.html';
};

document.getElementById('invite').onclick = function() {
  window.location.href = 'discovery.html';
};
