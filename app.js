const
	express       	= require("express"),
	bodyParser    	= require("body-parser"),
	cookieSession 	= require("cookie-session"),
	path          	= require("path"),
	crypto        	= require("crypto"),

	config        	= require("./config"),

	defaultroutes 	= require("./routes/default"),
	webuathnroutes  = require("./routes/webauthn"),
	tokenroutes   	= require("./routes/token"),

	app           	= express();

app.use(bodyParser.json());

// Sessions
app.use(cookieSession({
	name: "session",
	keys: [crypto.randomBytes(32).toString("hex")],
	//keys: database.getData("/keys"),
	// Cookie Options
	maxAge: config.cookieMaxAge
}));

//console.log(database.getData("/keys"));

// Static files (./static)
app.use(express.static(path.join(__dirname, "public/static")));

// Routes
app.use("/", defaultroutes);
app.use("/webauthn", webuathnroutes);
app.use("/token", tokenroutes);

const port = config.port;

// Local development
if (config.mode === "development") {
	const https = require("https");
	const fs = require("fs");
	let privateKey = fs.readFileSync("./keys/key.pem");
	let certificate = fs.readFileSync("./keys/cert.pem");
	https.createServer({
		key: privateKey,
		cert: certificate
	}, app).listen(port);  

// "Production" HTTP - (for use behind https proxy)
} else {
	app.listen(port);

}

console.log(`Started app on port ${port}`);

module.exports = app;
