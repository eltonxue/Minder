// ************
// *** AJAX ***
// ************

const GET_BASE_URL = '/users';
const POST_BASE_URL = '/users';
const PATCH_BASE_URL = '/user';
const DELETE_BASE_URL = '/user';

function postUser(name, email, password) {
  $button = $('#signup');
  $button.removeAttr('id');
  $button.attr('value', 'Signing up...');

  // CONVERT TO OBJECT
  let data = {
    name: name,
    email: email,
    password: password,
    description: 'N/A',
    school: 'N/A',
    major: 'N/A',
    minor: 'N/A',
    gpa: 'N/A',
    tags: [],
    connections: [],
    pendingInvites: [],
    pendingRequests: [],
    location: {
      name: 'San Francisco, CA, USA',
      geo: {
        type: 'Point',
        coordinates: [-122.1, 33.7]
      }
    },
    image:
      'https://www.thereminder.com/Templates/ReviewList/Review/icon-user-default.png'
  };

  $.get(GET_BASE_URL, function(getData, status) {
    console.log('GET Request:\nData: ' + getData + '\nStatus: ' + status);
    let exists = false;

    for (let i = 0; i < getData.length; ++i) {
      if (getData[i].email == email) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      // First Post registers the user into the database. Second Post logs the user in.
      $.post(POST_BASE_URL, data, function(postData, status) {
        let loginData = { email: email, password: password };
        $.post('/users/login', loginData, function(res, status) {
          // Signup Successful, redirect to self-profile
          if (res.redirect) {
            window.location.href = res.redirect;
          }
        });
      });
    } else {
      $('#signup-email').after("<p class='error'>Email already exists</p>");
      $button.attr('id', 'signup');
      $button.attr('value', 'Signup');
    }
  });
}

// *************
// *** LOGIN ***
// *************

function validUserLogin() {
  let email = $('#login-email').val();
  let password = $('#login-password').val();

  let flag = true;

  // Remove login button
  $button = $('#login');
  $button.removeAttr('id');
  $button.attr('value', 'Logging in...');

  let data = { email: email, password: password };

  $.post('/users/login', data, function(res, status) {
    console.log(res);

    if (res.error == 'email') {
      $('#login-email').after(res.code);
    } else if (res.error == 'password') {
      $('#login-password').after(res.code);
    }

    // Login Successful, redirect to self-profile
    if (res.redirect) {
      window.location.href = res.redirect;
    }
  });

  $button.attr('id', 'login');
  $button.attr('value', 'Login');
}

$('#login-form').submit(function(event) {
  event.preventDefault();

  // Clear error messsages
  $('#login-email').next().remove();
  $('#login-password').next().remove();

  // Manage AJAX calls
  let valid = validUserLogin();

  // Clear inputs
  $('#login-password').val('');
});

// **************
// *** SIGNUP ***
// **************

function validUserSignup() {
  let name = $('#signup-name').val();
  let email = $('#signup-email').val();
  let password = $('#signup-password').val();
  let confirm = $('#signup-confirm-password').val();

  let flag = true;
  if (name == '') {
    $('#signup-name').after("<p class='error'>Please enter a name</p>");
    flag = false;
  }
  if (email == '') {
    $('#signup-email').after("<p class='error'>Please enter an email</p>");
    flag = false;
  }

  if (password == '') {
    $('#signup-confirm-password').after(
      "<p class='error'>Please enter a password</p>"
    );
    flag = false;
  } else if (password != confirm) {
    $('#signup-confirm-password').after(
      "<p class='error'>Passwords do not match</p>"
    );
    flag = false;
  } else if (
    password.length < 8 ||
    password.search(/[a-z]/i) < 0 ||
    password.search(/[0-9]/) < 0
  ) {
    $('#signup-confirm-password').after(
      "<p class='error'>Password must be:<br>- greater than 8 characters<br>- contain at least 1 letter<br>- contain at least 1 number</p>"
    );
    flag = false;
  }
  return flag;
}

$('#signup-form').on('submit', function(event) {
  event.preventDefault();

  // Clear success/error messsages
  $('#signup-name').next().remove();
  $('#signup-email').next().remove();
  $('#signup-password').next().remove();
  $('#signup-confirm-password').next().remove();
  $('#signup').next().remove();

  // Manage AJAX calls
  let valid = validUserSignup();

  if (valid) {
    postUser(
      $('#signup-name').val(),
      $('#signup-email').val(),
      $('#signup-password').val()
    );
  }

  // Clear inputs
  $('#signup-password').val('');
  $('#signup-confirm-password').val('');
});
