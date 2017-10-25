// **************
// *** SERVER ***
// **************

const express = require('express');
const app = express();

app.get('/', function(req, res) {});

app.listen(8000, function() {
  console.log('Listening on port 8000');
});

app.use(express.static('src'));
