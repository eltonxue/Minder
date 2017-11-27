function onSend(event, textarea) {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    search();
  }
}

function createProfile(user) {
  let profile = $('<div></div>', { class: 'profile' });
  profile.attr('data-id', user._id);
  let image = $('<img>');
  image.attr('src', user.image);
  image.attr('class', 'profile-image');
  let name = $('<p></p>');
  name.text(user.name);
  name.css('font-weight', 'bold');

  profile.append(image);
  profile.append(name);
  profile.on('click', function() {
    window.location.href = `profile-${user._id}`;
  });

  return profile;
}

// LOADING INITIAL SUGGESTIONS
$.get('/user', function(sessionUser, status) {
  // POPULATE LOCALS
  const lng = sessionUser.location.geo.coordinates[0];
  const lat = sessionUser.location.geo.coordinates[1];
  $.get(`users/near?lat=${lat}&lng=${lng}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      let profile = createProfile(users[i]);

      $('#locals-container').append(profile);
    }
  });

  // POPULATE SIMILAR TAGS
  const tags = sessionUser.tags.join(',');
  $.get(`users/search-similar-tags?tags=${tags}`, function(users, status) {
    for (let i = 0; i < users.length; ++i) {
      let profile = createProfile(users[i]);
      let matches = $('<p></p>');
      let label = $('<span></span>');
      matches.html(
        `Matches: <strong style="color: #496124; font-size: 25px"> ${users[i]
          .tagMatches} </strong>`
      );

      profile.append(matches);

      $('#similar-tags-container').append(profile);
    }
  });

  // POPULATE RANDOM
  const n = 30;
  $.get(`users/global?results=${n}`, function(users, status) {
    let randoms = [];

    for (let i = 0; i < users.length; ++i) {
      if (users[i]) {
        if (randoms.indexOf(users[i]._id) == -1) {
          let profile = createProfile(users[i]);
          randoms.push(users[i]._id);
          $('#randoms-container').append(profile);
        }
      }
    }
  });
});

// SEARCH USERS BY NAME
function search() {
  $.get('/user', function(sessionUser, status) {
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
        if (users[i].email != sessionUser.email) {
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

$('#search').on('click', function() {
  search();
});
