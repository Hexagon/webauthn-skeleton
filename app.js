const Koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const defaultroutes = require('./routes/default');
const webuathnauth = require('./routes/webauthn.js');

const app = new Koa();

app.use(serve(path.join(__dirname, 'static')));
app.keys = [crypto.randomBytes(32).toString('hex')];
app.use(session({}, app));
app.use(bodyParser());
//Routes
app.use(defaultroutes.routes());
app.use(defaultroutes.allowedMethods());
app.use(webuathnauth.routes());
app.use(webuathnauth.allowedMethods());

const port = config.port || 3000;

// Local development
if (config.mode === 'development') {
  const https = require('https');
  const fs = require('fs');
  const privateKey = fs.readFileSync('./keys/key.pem');
  const certificate = fs.readFileSync('./keys/cert.pem');
  https.createServer({
    key: privateKey,
    cert: certificate
  }, app.callback()).listen(port);  

// "Production" HTTP - (for use behind https proxy)
} else {
  app.listen(port);

}

console.log(`Started app on port ${port}`);

module.exports = app;
