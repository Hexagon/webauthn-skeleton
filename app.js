const 
	Koa = require("koa"),
	serve = require("koa-static"),
	bodyParser = require("koa-bodyparser"),
	session = require("koa-session"),

	path = require("path"),
	crypto = require("crypto"),

	config = require("./config"),

	defaultroutes = require("./routes/default"),
	webuathnroutes = require("./routes/webauthn.js"),
	tokenroutes   	= require("./routes/token"),

	app = new Koa();

// Static files (./static)
app.use(serve(path.join(__dirname, "public/static")));

// Session
app.keys = [crypto.randomBytes(32).toString("hex")];
app.use(session({key: "session"}, app));

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
if (config.mode === "development") {
	const https = require("https");
	const fs = require("fs");
	https.createServer({
		key: fs.readFileSync("./keys/key.pem"),
		cert: fs.readFileSync("./keys/cert.pem")
	}, app.callback()).listen(config.port);  

// "Production" HTTP - (for use behind https proxy)
} else {
	app.listen(config.port);

}

console.log(`Started app on port ${config.port}`);