const
	config    = require("../config"),
	token     = require("../utils/token"),
	username  = require("../utils/username"),
	database  = require("../db/db"),

	router    = require('@koa/router')({ prefix: '/token' });

router.get("/login/:userName/:oneTimeToken", async (request, response) => {

	// Check that token exists
	if(!request.params.oneTimeToken) {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid token"
		};
	}

	// Check username
	let usernameClean = username.clean(request.params.userName);
	if(!usernameClean) {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid user"
		};
	}

	// Check that user exists
	if(!database.users[usernameClean] || !database.users[usernameClean].registered) {
		return ctx.body = {
			"status": "failed",
			"message": `User ${usernameClean} does not exist!`
		};
	}

	// Check that token validator exists
	let tokenValidator = database.users[usernameClean].oneTimeToken;
	if (!tokenValidator) {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid token!"
		};
	}

	// Validate token
	if (token.validate(usernameClean, request.params.oneTimeToken, tokenValidator )) {

		// Log in user
		request.session.username  = usernameClean;
		request.session.loggedIn = true;

		// Remove token
		delete database.users[usernameClean].oneTimeToken;

		// Success
		return response.redirect(config.baseUrl);
	} else {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid token!"
		};
	}

});

router.get("/generate", async (request, response) => {
	if(!request.session.loggedIn) {
		return ctx.body = {
			"status": "failed"
		};
	} else {

		const
			tokenValidator = token.generate(request.session.username,config.loginTokenExpireSeconds*1000),
			tokenEncoded = token.encode(tokenValidator.token);

		database.users[request.session.username].oneTimeToken = tokenValidator;

		return ctx.body = {
			"status": "ok",
			"token": tokenEncoded,
			"validForSeconds": config.loginTokenExpireSeconds,
			"url": config.baseUrl + "/token/login/" + request.session.username + "/" + tokenEncoded
		};
	}
});

module.exports = router;
