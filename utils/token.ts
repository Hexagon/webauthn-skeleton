import { base64 } from "../deps.ts";
import { username } from "./username.ts";

interface IToken {
	username: string;
	token: ArrayBuffer;
	expires: number;
}

// Generate a one time token for logging in on another device
const validate = (usernameInput: string, token: string, tokenValidator: IToken) => {
  
	// Try decoding token from base64url
	let tokenDecoded;
	try {
		tokenDecoded = base64.toArrayBuffer(token, true);
	} catch (_e) {
		return false;
	}

	// Note time now
	const timeNow = new Date().getTime();

	// Validate
	if (username.clean(usernameInput) !== tokenValidator.username) {
		return false;
	} else if (tokenValidator.expires < timeNow) {  
		return false;
	} else if (base64.fromArrayBuffer(tokenValidator.token,true) !== base64.fromArrayBuffer(tokenDecoded, true)) {
		return false;
	} else {
		// Success!
		return true;
	}

};

const generate = (usernameInput: string, expireMs: number) => {

	if (!expireMs) {
		return false;
	}

	if (!username) {
		return false;
	}
  
	const usernameClean = username.clean(usernameInput);
	if (!usernameClean) {
		return false;
	}

	const randomBytes = new Uint8Array(32);
	crypto.getRandomValues(randomBytes);

	const 
		token = randomBytes,
		internal : IToken = {
			username: usernameClean,
			token,
			expires: new Date().getTime() + expireMs
		};
  
	return internal;
};

// Encode token to base64url format
const encode = (token: ArrayBuffer) => {
	return base64.fromArrayBuffer(token, true);
};

const token = {
	encode,
	generate,
	validate
};

export { token };
export type { IToken };