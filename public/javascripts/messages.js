function onSend(event, textarea) {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    sendMessage();
  }
}

function sendMessage() {
  // Create HTML
  let input = document.getElementById('message-box');
  let message = document.createElement('p');
  message.className = 'message-text';
  message.innerHTML = input.value;

  let profileIcon = document.createElement('img');
  profileIcon.className = 'profile-icon-image';
  profileIcon.src = '../images/elton.jpg';

  let messageItem = document.createElement('div');
  messageItem.className = 'message-item';

  messageItem.appendChild(profileIcon);
  messageItem.appendChild(message);

  document.getElementById('messages').appendChild(messageItem);

  input.value = '';

  let scroll = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight;
}

document.getElementById('send').onclick = function() {
  sendMessage();
};
