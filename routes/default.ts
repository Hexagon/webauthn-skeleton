import { Router } from "../deps.ts";
import { database, IUser } from "../db/db.ts";
import { token } from "../utils/token.ts";

const router = new Router ();

/* Returns if user is logged in */
router.get("/isLoggedIn", async (request, response) => {
	// @ts-ignore: session exists
	const loggedIn = await request.session.get("loggedIn");
	if(!loggedIn) {
		response.json({
			"status": "failed"
		});
	} else {
		response.json({
			"status": "ok"
		});
	}
});

router.get("/logout", async (request, response) => {

	// Get session
	// @ts-ignore: session exists
	const session = request.session;

	await session.set("loggedIn",false);
	await session.set("username",undefined);
	response.json({
		"status": "ok"
	});
});

/* Returns personal info and THE SECRET INFORMATION */
router.get("/personalInfo", async (request, response) => {

	// Get session
	// @ts-ignore: session exists
	const session = request.session;

	const loggedIn = await session.get("loggedIn")
	if(!loggedIn) {
		response.json({
			"status": "failed",
			"message": "Access denied"
		});
	} else {
		const username = await session.get("username");
		const users = await database.getCollection<IUser>("users");
		let tokenInfo = undefined;
		const userInfo = await users.findOne({ userName: username });
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

export default router;
