// ************
// *** POST ***
// ************

// Creates a new user and adds them to the user database
function postUser(name, email, password) {
  // Disable signup button
  $button = $('#signup');
  $button.removeAttr('id');
  $button.attr('value', 'Signing up...');
  $button.attr('disabled', true);

  // Initializes a new user given user information
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
      'https://www.thereminder.com/Templates/ReviewList/Review/icon-user-default.png',
    unreadMessages: {}
  };

  // Check if the email is already in the user database
  $.get('/users', function(allUsers) {
    let exists = false;
    allUsers.forEach(function(user) {
      if (user.email === email) {
        exists = true;
      }
    });

    // If the user does not exist, add them to the user database and log them in
    // If not, display email already exists error
    if (!exists) {
      $.post('/users', data, function(user) {
        let loginData = { email, password };
        $.post('/users/login', loginData, function(res, status) {
          if (res.redirect) {
            // Redirect to /self-profile
            window.location.href = res.redirect;
          }
        });
      });
    } else {
      // Enable signup button
      $('#signup-email').after("<p class='error'>Email already exists</p>");
      $button.attr('id', 'signup');
      $button.attr('value', 'Signup');
      $button.attr('disabled', false);
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

  // Disable login button
  $button = $('#login');
  $button.removeAttr('id');
  $button.attr('value', 'Logging in...');
  $button.attr('disabled', true);

  let data = { email: email, password: password };

  $.post('/users/login', data, function(res, status) {
    if (res.error == 'email') {
      $('#login-email').after(res.code);
    } else if (res.error == 'password') {
      $('#login-password').after(res.code);
    }

    // Login successful, redirect to /self-profile
    if (res.redirect) {
      window.location.href = res.redirect;
    }
  });

  // Enable login button
  $button.attr('id', 'login');
  $button.attr('value', 'Login');
  $button.attr('disabled', false);
}

$('#login-form').submit(function(event) {
  event.preventDefault();

  // Clear error messsages
  $('#login-email').next().remove();
  $('#login-password').next().remove();

  // Check if login information is valid
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
