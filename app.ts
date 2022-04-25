import { opine, json, serveStatic, OpineSession, HTTPSOptions, HTTPOptions } from "./deps.ts";
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

// Set up config
let appConfig: HTTPSOptions | HTTPOptions;

// "Development" HTTPS
if (config.mode === "development") {
	appConfig = {
		port: parseInt(config.port, 10),
		certFile: "./keys/cert.pem",
		keyFile: "./keys/key.pem"
	}

// "Production" HTTP - (for use behind https proxy)
} else {
	appConfig = {
		port: parseInt(config.port, 10)
	};
}

// Start server
app.listen(appConfig,
	() => console.log("server has started on https://localhost:"+config.port+" 🚀"),
);