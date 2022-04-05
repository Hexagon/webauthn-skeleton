// Clean username
const username = { clean: function (username: string) {
	try {
		// Allow only certain characters
		let usernameClean = username.replace(/[^a-z0-9\-_]/gi,"");

		// Make lower case
		usernameClean = usernameClean.toLowerCase();

		return usernameClean;
	} catch (_e) {
		return;
	}
}};

export { username };