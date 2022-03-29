const 
	Fido2     = require("../utils/fido2"),
	config    = require("../config"),
	crypto    = require("crypto"),
	database  = require("../db/db"),
	username  = require("../utils/username"),
	base64    = require("@hexagon/base64"),

	router 	  = require("@koa/router")({ prefix: "/webauthn" }),
	
	f2l       = new Fido2(config.rpId, config.rpName, undefined, config.challengeTimeoutMs),
	
	userNameMaxLenght = 25;

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
let randomBase64URLBuffer = (len) => {
	len = len || 32;
	let buff = crypto.randomBytes(len);
	return base64.fromArrayBuffer(buff, true);
};

router.post("/register", async (ctx) => {
	if(!ctx.request.body || !ctx.request.body.username || !ctx.request.body.name) {
		return ctx.body = {
			"status": "failed",
			"message": "ctx missing name or username field!"
		};
	}

	let usernameClean = username.clean(ctx.request.body.username),
		name     = usernameClean;

	if (!usernameClean) {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid username!"
		};
	}

	if ( usernameClean.length > userNameMaxLenght ) {
		response.json({
			"status": "failed",
			"message": "Username " + usernameClean + " too long. Max username lenght is " + userNameMaxLenght + " characters!"
		});
		return;
	}

	let db = database.getData("/");

	//if(database.users[usernameClean] && database.users[usernameClean].registered) {
	if(db.users[usernameClean] && db.users[usernameClean].registered) {
		return ctx.body = {
			"status": "failed",
			"message": `Username ${usernameClean} already exists`
		};
	}

	let id = randomBase64URLBuffer();

	//database.users[usernameClean] = {
	database.push("/users", { [usernameClean]: {
		"name": name,
		"registered": false,
		"id": id,
		"authenticators": [],
		"oneTimeToken": undefined,
		"recoveryEmail": undefined
	//};
	}}, false);

	let challengeMakeCred = await f2l.registration(usernameClean, name, id);

	// Transfer challenge and username to session
	ctx.session.challenge = challengeMakeCred.challenge;
	ctx.session.username  = usernameClean;

	// Respond with credentials
	return ctx.body = challengeMakeCred;
});


router.post("/add", async (ctx) => {
	if(!ctx.request.body) {
		return ctx.body = {
			"status": "failed",
			"message": "ctx missing name or username field!"
		};
	}

	if(!ctx.session.loggedIn) {
		return ctx.body = {
			"status": "failed",
			"message": "User not logged in!"
		};
	}

	let usernameClean = username.clean(ctx.session.username),
		name     = usernameClean,
		//id       = database.users[ctx.session.username].id;
		id = database.getData("/users/" + ctx.session.username + "/id");

	let challengeMakeCred = await f2l.registration(usernameClean, name, id);

	// Transfer challenge to session
	ctx.session.challenge = challengeMakeCred.challenge;

	// Exclude existing credentials
	challengeMakeCred.excludeCredentials = database.getData("/users/" + ctx.session.username + "/authenticators").map((e) => {
		return { id: base64.fromArrayBuffer(e.credId, true), type: e.type };
	});

	// Respond with credentials
	return ctx.body = challengeMakeCred;
});

router.post("/login", async (ctx) => {
	if(!ctx.request.body || !ctx.request.body.username) {
		return ctx.body = {
			"status": "failed",
			"message": "ctx missing username field!"
		};
	}

	let usernameClean = username.clean(ctx.request.body.username);

	let db = database.getData("/");

	//if(!database.users[usernameClean] || !database.users[usernameClean].registered) {
	if(!db.users[usernameClean] || !db.users[usernameClean].registered) {
		return ctx.body = {
			"status": "failed",
			"message": `User ${usernameClean} does not exist!`
		};
	}

	let assertionOptions = await f2l.login(usernameClean);

	// Transfer challenge and username to session
	ctx.session.challenge = assertionOptions.challenge;
	ctx.session.username  = usernameClean;

	// Pass this, to limit selectable credentials for user... This may be set in response instead, so that
	// all of a users server (public) credentials isn't exposed to anyone
	let allowCredentials = [];
	//for(let authr of database.users[ctx.session.username].authenticators) {
	for(let authr of database.getData("/users/" + ctx.session.username + "/authenticators")) {
		allowCredentials.push({
			type: authr.type,
			id: base64.fromArrayBuffer(authr.credId, true),
			transports: authr.transports
		});
	}

	assertionOptions.allowCredentials = allowCredentials;

	ctx.session.allowCredentials = allowCredentials;

	return ctx.body = assertionOptions;
});

router.post("/response", async (ctx) => {
	if(!ctx.request.body       || !ctx.request.body.id
    || !ctx.request.body.rawId || !ctx.request.body.response
    || !ctx.request.body.type  || ctx.request.body.type !== "public-key" ) {
		return ctx.body = {
			"status": "failed",
			"message": "Response missing one or more of id/rawId/response/type fields, or type is not public-key!"
		};
	}
	let webauthnResp = ctx.request.body;
	if(webauthnResp.response.attestationObject !== undefined) {
		/* This is create cred */
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.attestationObject = base64.toArrayBuffer(webauthnResp.response.attestationObject, true);
		const result = await f2l.attestation(webauthnResp, config.origin, ctx.session.challenge);

		const token = {
			credId: result.authnrData.get("credId"),
			publicKey: result.authnrData.get("credentialPublicKeyPem"),
			type: webauthnResp.type,
			transports: webauthnResp.transports,
			counter: result.authnrData.get("counter"),
			created: new Date().getTime(),
		};

		database.push("/users/" + ctx.session.username + "/authenticators[]", token);

		//database.users[ctx.session.username].registered = true;
		database.push("/users/" + ctx.session.username + "/registered", true);

		ctx.session.loggedIn = true;

		return ctx.body = { "status": "ok" };


	} else if(webauthnResp.response.authenticatorData !== undefined) {
		/* This is get assertion */
		//result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database.users[ctx.session.username].authenticators);
		// add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialctxoptions-allowcredentials).
		// save the challenge in the session information...
		// send authnOptions to client and pass them in to `navigator.credentials.get()`...
		// get response back from client (clientAssertionResponse)
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.userHandle = base64.toArrayBuffer(webauthnResp.rawId, true);
		//let validAuthenticators = database.users[ctx.session.username].authenticators,
		let validAuthenticators = database.getData("/users/" + ctx.session.username + "/authenticators"),
			winningAuthenticator;            
		for(let authrIdx in validAuthenticators) {
			let authr = validAuthenticators[authrIdx];
			try {
				let assertionExpectations = {
					// Remove the following comment if allowCredentials has been added into authnOptions so the credential received will be validate against allowCredentials array.
					allowCredentials: ctx.session.allowCredentials,
					challenge: ctx.session.challenge,
					origin: config.origin,
					factor: "either",
					publicKey: authr.publicKey,
					prevCounter: authr.counter,
					userHandle: authr.credId
				};

				let result = await f2l.assertion(webauthnResp, assertionExpectations);

				winningAuthenticator = result;
				if (database.users[ctx.session.username].authenticators[authrIdx]) {
					database.users[ctx.session.username].authenticators[authrIdx].counter = result.authnrData.get("counter");
				}                    
				break;
        
			} catch (e) {
				// Ignore
			}
		}
		// authentication complete!
		//if (winningAuthenticator && database.users[ctx.session.username].registered ) {
		if (winningAuthenticator && database.getData("/users/" + ctx.session.username + "/registered") ) {
			ctx.session.loggedIn = true;
			return ctx.body = { "status": "ok" };

			// Authentication failed
		} else {
			return ctx.body = {
				"status": "failed",
				"message": "Can not authenticate signature!"
			};
		}
	} else {
		return ctx.body = {
			"status": "failed",
			"message": "Can not authenticate signature!"
		};
	}
});

module.exports = router;