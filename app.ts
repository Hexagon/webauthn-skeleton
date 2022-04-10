import { opine, json, serveStatic, OpineSession } from "./deps.ts";
import { config } from "./config.ts";
import defaultRoutes from "./routes/default.ts";
import tokenRoutes from "./routes/token.ts";
import webauthnRoutes from "./routes/webauthn.ts";

const app = opine();

// Enable sessions
new OpineSession(app);

// Enable json body parser
app.use(json());
app.use(serveStatic("./public/static"));

// Set up routes
app.use("/", defaultRoutes);
app.use("/token", tokenRoutes);
app.use("/webauthn", webauthnRoutes);

// Start server
app.listen({ 
	port: parseInt(config.port, 10),
	certFile: "./keys/cert.pem",
	keyFile: "./keys/key.pem",
},
  () => console.log("server has started on https://localhost:"+config.port+" 🚀"),
);

/*const
	crypto        	= require("crypto"),
	
// Sessions
app.use(cookieSession({
	name: "session",
	keys: [crypto.randomBytes(32).toString("hex")],
	//keys: database.getData("/keys"),
	// Cookie Options
	maxAge: config.cookieMaxAge
}));


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

}*/