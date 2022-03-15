const 
	database = require("../db/db"),
	token    = require("../utils/token"),
	//mime 	 = require('mime-types')

	router   = require("@koa/router")();

/* Returns if user is logged in */
router.get("/isLoggedIn", (ctx) => {
	if(!ctx.session.loggedIn) {
		return ctx.body = {
			"status": "failed"
		};
	} else {
		return ctx.body = {
			"status": "ok"
		};
	}
});

/* Logs user out */
router.get("/logout", (ctx) => {
	ctx.session.loggedIn = false;
	ctx.session.username = undefined;

	return ctx.body = {
		"status": "ok"
	};
});

/* Returns personal info and THE SECRET INFORMATION */
router.get("/personalInfo", (ctx) => {
	if(!ctx.session.loggedIn) {
		return ctx.body = {
			"status": "failed",
			"message": "Access denied"
		};
	} else {
		let tokenInfo = undefined,
			//userInfo = database.users[ctx.session.username];
			userInfo = database.getData("/users/"+ ctx.session.username);
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
		return ctx.body = {
			"status": "ok",
			"authenticators": userInfo.authenticators,
			"name": userInfo.name,
			"oneTimeToken": tokenInfo,
			"recoveryEmail": userInfo.recoveryEmail
		};
	}
});

router.get("/users", (ctx) => {
	let usersArray = database.getData("/users");
	let users=Object.keys(usersArray);
	
	for (let fai = (users.length - 1); fai >= 0; fai--) {
		if ( usersArray[users[fai]].registered != true) {
			users.splice(fai,1);
		}
	}

	let myReponse = {"status": "ok", "users": users};
	//response.json(myReponse);
	//Sreturn ctx.body = myReponse;
	//let jsonType = mime.lookup('json');
	//ctx.response.set("content-type", jsonType);
	return ctx.body = JSON.stringify(myReponse);

});

module.exports = router;