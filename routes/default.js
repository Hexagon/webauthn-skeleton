const express  = require("express");
const router   = express.Router();
const database = require("./db");
const token    = require("../utils/token");

/* Returns if user is logged in */
router.get("/isLoggedIn", (request, response) => {
	if(!request.session.loggedIn) {
		response.json({
			"status": "failed"
		});
	} else {
		response.json({
			"status": "ok"
		});
	}
});

/* Logs user out */
router.get("/logout", (request, response) => {
	request.session.loggedIn = false;
	request.session.username = undefined;

	response.json({
		"status": "ok"
	});
});

/* Returns personal info and THE SECRET INFORMATION */
router.get("/personalInfo", (request, response) => {
	if(!request.session.loggedIn) {
		response.json({
			"status": "failed",
			"message": "Access denied"
		});
	} else {
		let tokenInfo = undefined,
			userInfo = database.users[request.session.username];
		if (userInfo.oneTimeToken) {            
			if (userInfo.oneTimeToken.expires > new Date().getTime()) {
				tokenInfo = { 
					token: token.encode(userInfo.oneTimeToken.token),
					expires: userInfo.oneTimeToken.expires 
				};
			} else {
				tokenInfo = undefined;
				userInfo.oneTimeToken = undefined;
			}
		}
		response.json({
			"status": "ok",
			"authenticators": userInfo.authenticators,
			"name": userInfo.name,
			"oneTimeToken": tokenInfo,
			"recoveryEmail": userInfo.recoveryEmail
		});
	}
});

module.exports = router;
