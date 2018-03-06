var express = require('express');
var morgan = require('morgan')
var cors = require('cors')

var app = express();

app.use(morgan('combined'))
app.use(cors({credentials: true, origin: 'http://localhost:8001'}));

app.use(express.static('public'));


app.listen(8002, function() {
  console.log('server start listen 8002')
})