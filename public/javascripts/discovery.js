let profiles = document.querySelectorAll('.profile');

let redirect = function() {
  window.location.href = 'user-profile';
};

for (let i = 0; i < profiles.length; ++i) {
  profiles[i].onclick = function() {
    redirect();
  };
}

function createProfile(user) {
  let profile = $('<div></div>', { class: 'profile' });
  let image = $('<img>');
  image.attr('src', user.image);
  image.attr('class', 'profile-image');
  let name = $('<p></p>');
  name.text(user.name);

  profile.append(image);
  profile.append(name);
  profile.on('click', function() {
    window.location.href = `profile-${user._id}`;
  });

  return profile;
}

// LOADING INITIAL SUGGESTIONS
$.get('/user', function(data, status) {
  // POPULATE LOCALS
  const lng = data.location.geo.coordinates[0];
  const lat = data.location.geo.coordinates[1];
  $.get(`users/near?lat=${lat}&lng=${lng}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      if (users[i].email != data.email) {
        let profile = createProfile(users[i]);

        $('#locals-container').append(profile);
      }
    }
  });

  // POPULATE SIMILAR TAGS
  const tags = data.tags.join(',');
  $.get(`users/search-similar-tags?tags=${tags}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      if (users[i].email != data.email) {
        let profile = createProfile(users[i]);
        let matches = $('<p></p>');
        matches.text('Matches: ' + users[i].tagMatches);

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
        let profile = createProfile(users[i]);

        $('#randoms-container').append(profile);
      }
    }
  });
});

function onSend(event, textarea) {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    search();
  }
}
$('#search').on('click', function() {
  search();
});

// SEARCH FUNCTION BY NAME
function search() {
  $.get('/user', function(data, status) {
    $('#search-container').parent().remove();
    let name = $('#search-bar').val().replace(' ', '+');
    $.get(`/users/search-by-name?name=${name}`, function(users, status) {
      let infoContainer = $('<div></div>', { class: 'match-info' });
      let header = $('<h2></h2>');
      header.text(`Search Results (${users.length} results)`);
      let searchContainer = $('<div></div>', {
        id: 'search-container',
        class: 'container'
      });

      for (let i = 0; i < users.length; ++i) {
        if (users[i].email != data.email) {
          let profile = createProfile(users[i]);

          searchContainer.append(profile);
        }
      }

      infoContainer.append(header);
      infoContainer.append(searchContainer);
      $('#main-container').attr('class', '');
      $('#main-container').append(infoContainer);

      // Remove all other suggestions
      $('#locals-container').parent().remove();
      $('#similar-tags-container').parent().remove();
      $('#randoms-container').parent().remove();
    });
  });
}
