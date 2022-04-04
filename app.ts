import { opine, json, serveStatic, OpineSession } from "./deps.ts";
import { config } from "./config.ts";
import defaultRoutes from "./routes/default.ts";

const app = opine();

// Enable sessions
new OpineSession(app);

// Enable json body parser
app.use(json());
app.use(serveStatic("./public/static"));

// Set up routes
app.use("/", defaultRoutes);

app.listen(
  parseInt(config.port,10),
  () => console.log("server has started on http://localhost:"+config.port+" 🚀"),
);

/*const
	crypto        	= require("crypto"),

	defaultroutes 	= require("./routes/default"),
	webuathnroutes  = require("./routes/webauthn"),
	tokenroutes   	= require("./routes/token"),

	app           	= express();

	
// Sessions
app.use(cookieSession({
	name: "session",
	keys: [crypto.randomBytes(32).toString("hex")],
	//keys: database.getData("/keys"),
	// Cookie Options
	maxAge: config.cookieMaxAge
}));

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

module.exports = app;*/
