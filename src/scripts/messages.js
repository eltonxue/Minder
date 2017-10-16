function onSend(event, textarea) {
  var code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    sendMessage();
  }
}

function sendMessage() {
  // Create HTML
  var input = document.getElementById('message-box');
  var message = document.createElement('p');
  message.className = 'message-text';
  message.innerHTML = input.value;

  var profileIcon = document.createElement('img');
  profileIcon.className = 'profile-icon-image';
  profileIcon.src = '../assets/elton.jpg';

  var messageItem = document.createElement('div');
  messageItem.className = 'message-item';

  messageItem.appendChild(profileIcon);
  messageItem.appendChild(message);

  document.getElementById('messages').appendChild(messageItem);

  input.value = '';

  var scroll = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight;
}

document.getElementById('send').onclick = function() {
  sendMessage();
};
