
import { Router } from "../deps.ts";
import { config } from "../config.ts";
import { database, IUser, IAuthenticator } from "../db/db.ts";
import { username } from "../utils/username.ts";
import { base64 } from "../deps.ts";
import { Fido2, IAssertionExpectations } from "../utils/fido2.ts";

const userNameMaxLenght = 25;

const router = new Router ();

const f2l = new Fido2(config.rpId, config.rpName, undefined, config.challengeTimeoutMs);

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
const randomBase64URLBuffer = (len : number) => {
	len = len || 32;
	const randomBytes = new Uint8Array(len);
	crypto.getRandomValues(randomBytes);
	return base64.fromArrayBuffer(randomBytes, true);
};

router.post("/register", async (request, response) => {

	// Get session
	// @ts-ignore: session exists
	const session = request.session;
	
	if(!request.body || !request.body.username || !request.body.name) {
		response.json({
			"status": "failed",
			"message": "Request missing name or username field!"
		});
		return;
	}

	const usernameClean = username.clean(request.body.username),
		name     = usernameClean;

	if (!usernameClean) {
		return response.json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}
    
	if ( usernameClean.length > userNameMaxLenght ) {
		return response.json({
			"status": "failed",
			"message": "Username " + usernameClean + " too long. Max username lenght is " + userNameMaxLenght + " characters!"
		});
	}

	const users = await database.getCollection<IUser>("users");
	const userInfo = await users.findOne({ userName: usernameClean });

	if(userInfo && userInfo.registered) {
		return response.json({
			"status": "failed",
			"message": `Username ${usernameClean} already exists`
		});
	}

	const id = randomBase64URLBuffer(32);

	await users.insertOne({
		userName: usernameClean,
		name: name,
		registered: false,
		id: id,
		authenticators: [],
		oneTimeToken: undefined,
		recoveryEmail: undefined
	});

	const challengeMakeCred = await f2l.registration(usernameClean, usernameClean, id);

	// Transfer challenge and username to session
	await session.set("challenge", challengeMakeCred.challenge);
	await session.set("username", usernameClean);

	// Respond with credentials
	response.json(challengeMakeCred);
});


router.post("/add", async (request, response) => {

	// Get session
	// @ts-ignore: session exists
	const session = request.session;
	
	if(!request.body) {
		return response.json({
			"status": "failed",
			"message": "Request missing name or username field!"
		});
	}

	if(!await session.get("loggedIn")) {
		return response.json({
			"status": "failed",
			"message": "User not logged in!"
		});
	}

	const
		usernameClean = username.clean(await session.get("username"));

	
	if(!usernameClean) {
		return response.json({
			"status": "failed",
			"message": "Invalid username!"
		});
	}
	
	const users = await database.getCollection<IUser>("users");
	const userInfo = await users.findOne({ userName: usernameClean });

	const challengeMakeCred = await f2l.registration(usernameClean, usernameClean, userInfo.id || "");

	// Transfer challenge to session
	await session.set("challenge", challengeMakeCred.challenge);

	// Exclude existing credentials
	challengeMakeCred.excludeCredentials = userInfo.authenticators?.map((e) => { 
		return { id: e.credId, type: e.type };
	}); 
	// Respond with credentials
	response.json(challengeMakeCred);
});

router.post("/login", async (request, response) => {
	if(!request.body || !request.body.username) {
		return response.json({
			"status": "failed",
			"message": "Request missing username field!"
		});
	}

	// Get session
	// @ts-ignore: session exists
	const session = request.session;

	const usernameClean = username.clean(request.body.username);

	const users = await database.getCollection<IUser>("users");
	const userInfo = await users.findOne({ userName: usernameClean });

	if(!userInfo || !userInfo.registered || !usernameClean) {
		return response.json({
			"status": "failed",
			"message": `User ${usernameClean} does not exist!`
		});
	}

	if(!userInfo || !userInfo.authenticators || userInfo.authenticators.length === 0) {
		return response.json({
			"status": "failed",
			"message": `User ${usernameClean} can not log in!`
		});
	}

	const assertionOptions = await f2l.login();

	// Transfer challenge and username to session
	await session.set("challenge", assertionOptions.challenge);
	await session.set("username", usernameClean);

	// Pass this, to limit selectable credentials for user... This may be set in response instead, so that
	// all of a users server (public) credentials isn't exposed to anyone
	const allowCredentials = [];
	for(const authr of userInfo.authenticators) {
		allowCredentials.push({
			type: authr.type,
			id: authr.credId,
			transports: authr.transports
		});
	}

	assertionOptions.allowCredentials = allowCredentials;

	await session.set("allowCredentials", allowCredentials);

	response.json(assertionOptions);

});

router.post("/response", async (request, response) => {
	if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== "public-key" ) {
		return response.json({
			"status": "failed",
			"message": "Response missing one or more of id/rawId/response/type fields, or type is not public-key!"
		});
	}

	// Get session
	// @ts-ignore: session exists
	const session = request.session;

	// Get user info
	const usernameClean = username.clean(await session.get("username"));
	const users = await database.getCollection<IUser>("users");
	const userInfo = await users.findOne({ userName: usernameClean });

	const webauthnResp = request.body;
	if(webauthnResp.response.attestationObject !== undefined) {
		/* This is create cred */
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.attestationObject = base64.toArrayBuffer(webauthnResp.response.attestationObject, true);
		const result = await f2l.attestation(webauthnResp, config.origin, await session.get("challenge"));
        
		const token : IAuthenticator = {
			credId: base64.fromArrayBuffer(result.authnrData.get("credId"), true),
			publicKey: result.authnrData.get("credentialPublicKeyPem"),
			type: webauthnResp.type,
			transports: webauthnResp.transports,
			counter: result.authnrData.get("counter"),
			created: new Date(),
		};
		
		const newAuthenticators = userInfo.authenticators ? [...userInfo.authenticators] : [];
		newAuthenticators.push(token);
		users.updateOne({userName: usernameClean}, { authenticators: newAuthenticators, registered: true });

		await session.set("loggedIn", true);

		return response.json({ "status": "ok" });

	} else if(webauthnResp.response.authenticatorData !== undefined) {
		/* This is get assertion */
		//result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database.users[request.session.username].authenticators);
		// add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialrequestoptions-allowcredentials).
		// save the challenge in the session information...
		// send authnOptions to client and pass them in to `navigator.credentials.get()`...
		// get response back from client (clientAssertionResponse)
		webauthnResp.rawId = base64.toArrayBuffer(webauthnResp.rawId, true);
		webauthnResp.response.userHandle = webauthnResp.rawId;

		let winningAuthenticator;            
		for(const authrIdx in userInfo.authenticators) {
			const authr = userInfo.authenticators[parseInt(authrIdx, 10)];
			try {
				const assertionExpectations : IAssertionExpectations = {
					allowCredentials: await session.get("allowCredentials"),
					challenge: await session.get("challenge"),
					origin: config.origin,
					factor: "either",
					publicKey: authr.publicKey,
					prevCounter: authr.counter,
					userHandle: authr.credId
				};
				const result = await f2l.assertion(webauthnResp, assertionExpectations);

				winningAuthenticator = result;
				
				// Update authenticators
				userInfo.authenticators[parseInt(authrIdx, 10)].counter = result.authnrData.get("counter");
				await users.updateOne({userName: userInfo.userName}, { authenticators: userInfo.authenticators});
				break;
        
			} catch (_e) {
				console.error(_e);
			}
		}
		// authentication complete!
		if (winningAuthenticator && userInfo.registered) {
			await session.set("loggedIn", true);
			return response.json({ "status": "ok" });

			// Authentication failed
		} else {
			return response.json({
				"status": "failed",
				"message": "Can not authenticate signature!"
			});
		}
	} else {
		return response.json({
			"status": "failed",
			"message": "Can not authenticate signature!"
		});
	}
});

export default router;