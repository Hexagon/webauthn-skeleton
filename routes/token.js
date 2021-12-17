const
	config    = require("../config"),
	token     = require("../utils/token"),
	username  = require("../utils/username"),
	database  = require("../db/db"),

	router    = require("@koa/router")({ prefix: "/token" });

router.get("/login/:userName/:oneTimeToken", async (ctx) => {

	// Check that token exists
	if(!ctx.params.oneTimeToken) {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid token"
		};
	}

	// Check username
	let usernameClean = username.clean(ctx.params.userName);
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
	if (token.validate(usernameClean, ctx.params.oneTimeToken, tokenValidator )) {

		// Log in user
		ctx.session.username  = usernameClean;
		ctx.session.loggedIn = true;

		// Remove token
		delete database.users[usernameClean].oneTimeToken;

		// Success
		return ctx.redirect(config.baseUrl);
	} else {
		return ctx.body = {
			"status": "failed",
			"message": "Invalid token!"
		};
	}

});

router.get("/generate", async (ctx) => {
	if(!ctx.session.loggedIn) {
		return ctx.body = {
			"status": "failed"
		};
	} else {

		const
			tokenValidator = token.generate(ctx.session.username,config.loginTokenExpireSeconds*1000),
			tokenEncoded = token.encode(tokenValidator.token);

		database.users[ctx.session.username].oneTimeToken = tokenValidator;

		return ctx.body = {
			"status": "ok",
			"token": tokenEncoded,
			"validForSeconds": config.loginTokenExpireSeconds,
			"url": config.baseUrl + "/token/login/" + ctx.session.username + "/" + tokenEncoded
		};
	}
});

module.exports = router;
