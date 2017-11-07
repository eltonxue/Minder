let profiles = document.querySelectorAll('.profile');

let redirect = function() {
  window.location.href = 'user-profile';
};

for (let i = 0; i < profiles.length; ++i) {
  profiles[i].onclick = function() {
    redirect();
  };
}

$.get('/user', function(data, status) {
  // POPULATE LOCALS
  const lng = data.location.geo.coordinates[0];
  const lat = data.location.geo.coordinates[1];
  $.get(`users/near?lat=${lat}&lng=${lng}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      if (users[i].email != data.email) {
        let profile = $('<div></div>', { class: 'profile' });
        let image = $('<img>');
        image.attr('src', users[i].image);
        image.attr('class', 'profile-image');
        let name = $('<p></p>');
        name.text(users[i].name);
        profile.append(image);
        profile.append(name);

        $('#locals-container').append(profile);
      }
    }
  });

  // POPULATE SIMILAR TAGS
  const tags = data.tags.join(',');
  $.get(`users/search?tags=${tags}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      if (users[i].email != data.email) {
        let profile = $('<div></div>', { class: 'profile' });
        let image = $('<img>');
        image.attr('src', users[i].image);
        image.attr('class', 'profile-image');
        let name = $('<p></p>');
        name.text(users[i].name);
        let matches = $('<p></p>');
        matches.text('Matches: ' + users[i].tagMatches);

        profile.append(image);
        profile.append(name);
        profile.append(matches);

        $('#similar-tags-container').append(profile);
      }
    }
  });

  // POPULATE RANDOM
  const n = 20;
  $.get(`users/global?results=${n}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      if (users[i].email != data.email) {
        let profile = $('<div></div>', { class: 'profile' });
        let image = $('<img>');
        image.attr('src', users[i].image);
        image.attr('class', 'profile-image');
        let name = $('<p></p>');
        name.text(users[i].name);

        profile.append(image);
        profile.append(name);

        $('#randoms-container').append(profile);
      }
    }
  });
});
