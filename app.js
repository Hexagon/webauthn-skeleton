const Koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

const path = require('path');
const crypto = require('crypto');

const config = require('./config');

const defaultroutes = require('./routes/default');
const webuathnauth = require('./routes/webauthn.js');
const tokenroutes   	= require("./routes/token");

const app = new Koa();

// Static files (./static)
app.use(serve(path.join(__dirname, 'public/static')));

// Session
app.keys = [crypto.randomBytes(32).toString('hex')];
app.use(session({}, app));

// Middleware
app.use(bodyParser());

//Routes
app.use(defaultroutes.routes());
app.use(defaultroutes.allowedMethods());

app.use(webuathnroutes.routes());
app.use(webuathnroutes.allowedMethods());

app.use(tokenroutes.routes());
app.use(tokenroutes.allowedMethods());

// Local development
if (config.mode === 'development') {
  const https = require('https');
  const fs = require('fs');
  https.createServer({
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
  }, app.callback()).listen(port);  

// "Production" HTTP - (for use behind https proxy)
} else {
	app.listen(port);

}

console.log(`Started app on port ${port}`);

module.exports = app;
