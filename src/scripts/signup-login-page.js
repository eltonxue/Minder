// ************
// *** AJAX ***
// ************

const GET_BASE_URL = 'http://thiman.me:1337/eltonxue/users';
const POST_BASE_URL = 'http://thiman.me:1337/eltonxue/user';
const PATCH_BASE_URL = 'http://thiman.me:1337/eltonxue/user';
const DELETE_BASE_URL = 'http://thiman.me:1337/eltonxue/user';

function postUser(name, email, password) {
  let data = { name: name, email: email, password: password };
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
      $.post(POST_BASE_URL, data, function(postData, status) {
        console.log('POST Request:\nData: ' + postData + '\nStatus: ' + status);
      });
    } else {
      $('#signup-email').after("<p class='error'>Email already exists</p>");
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

  $.get(GET_BASE_URL, function(getData, status) {
    console.log('GET Request:\nData: ' + getData + '\nStatus: ' + status);

    let user = null;
    for (let i = 0; i < getData.length; ++i) {
      if (getData[i].email == email) {
        user = getData[i];
        break;
      }
    }
    if (user == null) {
      $('#login-email').after("<p class='error'>Email does not exist</p>");
      flag = false;
    } else if (user.password != password) {
      $('#login-password').after("<p class='error'>Incorrect Password</p>");
      flag = false;
    }
    alert(flag);
  });
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

  // Clear error messsages
  $('#signup-name').next().remove();
  $('#signup-email').next().remove();
  $('#signup-password').next().remove();
  $('#signup-confirm-password').next().remove();

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
  $('#signup-name').val('');
  $('#signup-email').val('');
  $('#signup-password').val('');
  $('#signup-confirm-password').val('');
});
