const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const request = require('request-promise');

http.createServer(app.callback()).listen(9000);

https.createServer({
  key: fs.readFileSync(path.join('./fixtures', 'agent2-key.pem')),
  cert: fs.readFileSync(path.join('./fixtures', 'agent2-cert.pem'))
}, app.callback()).listen(9001);

app.use(async ctx => {
  console.log(ctx.request.url)
  console.log(ctx.response)
  let result = await request(ctx.request.url);

  ctx.body = result;
});