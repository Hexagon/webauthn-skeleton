// Base configuration
const config = {
	"port": "3002",
	"origin": "https://localhost:3002",
	"rpId": "localhost",
	"rpName": "Webauthn Skeleton",
	"mode": "development",
	"baseUrl": "", // Uses origin as default
	"cookieMaxAge": 24 * 60 * 60 * 1000, // 24 hours
	"challengeTimeoutMs": 90 * 1000, // 90 seconds
	"loginTokenExpireSeconds": 60	
};

// Environment overrides (normally no need to touch this)
config.port = Deno.env.get("PORT") || config.port;
config.origin = Deno.env.get("WAS_ORIGIN") || config.origin;
config.rpId = Deno.env.get("WAS_RPID") || config.rpId;
config.rpName = Deno.env.get("WAS_RPNAME") || config.rpName;
config.mode = Deno.env.get("WAS_MODE") || config.mode;
config.baseUrl = Deno.env.get("WAS_BASE_URL") || config.baseUrl || config.origin;

// Forced cleanup (normally no need to touch this)
// - Remove trailing slash from origin and baseUrl
config.baseUrl = config.baseUrl?.substr(-1) === "/" ? config.baseUrl?.slice(0,-1) : config.baseUrl;
config.origin = config.origin?.substr(-1) === "/" ? config.origin?.slice(0,-1) : config.origin;

export { config };