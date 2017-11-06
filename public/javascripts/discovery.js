let profiles = document.querySelectorAll('.profile');

let redirect = function() {
  window.location.href = 'user-profile';
};

for (let i = 0; i < profiles.length; ++i) {
  profiles[i].onclick = function() {
    redirect();
  };
}

axios.get('');
