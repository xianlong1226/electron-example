var express = require('express');
var morgan = require('morgan')

var app = express();

app.use(morgan('combined'))

app.use(express.static('public'));
app.use('/publish', express.static('../publish'))
app.get('/getdata', function(req, res) {
  res.json({status: 'success', data: new Date().getTime(), message: "成功"})
})

app.listen(8001, function() {
  console.log('server start listen 8001')
})