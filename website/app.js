var express = require('express');
var morgan = require('morgan')

var app = express();

app.use(morgan('combined'))

app.use(express.static('public'));

app.listen(8001, function() {
  console.log('server start listen 8001')
})