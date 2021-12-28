/* global base64 */
/* exported preformatGetAssertReq, publicKeyCredentialToJSON, preformatMakeCredReq */

/**
 * Converts PublicKeyCredential into serialised JSON
 * @param  {Object} pubKeyCred
 * @return {Object}            - JSON encoded publicKeyCredential
 */
const publicKeyCredentialToJSON = (pubKeyCred) => {
	/* ----- DO NOT MODIFY THIS CODE ----- */
	if(pubKeyCred instanceof Array) {
		let arr = [];
		for(let i of pubKeyCred)
			arr.push(publicKeyCredentialToJSON(i));

		return arr;
	}

	if(pubKeyCred instanceof ArrayBuffer) {
		return base64.fromArrayBuffer(pubKeyCred,true);
	}

	if(pubKeyCred instanceof Object) {
		let obj = {};

		for (let key in pubKeyCred) {
			obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
		}

		return obj;
	}

	return pubKeyCred;
};

/**
 * Decodes arrayBuffer required fields.
 */
let preformatMakeCredReq = (makeCredReq) => {
	makeCredReq.challenge = base64.toArrayBuffer(makeCredReq.challenge,true);
	makeCredReq.user.id = base64.toArrayBuffer(makeCredReq.user.id,true);

	// Decode id of each excludeCredentials
	if (makeCredReq.excludeCredentials) {
		makeCredReq.excludeCredentials = makeCredReq.excludeCredentials.map((e) => { return { id: base64.toArrayBuffer(e.id, true), type: e.type };});
	}

	return makeCredReq;
};

/**
 * Decodes arrayBuffer required fields.
 */
let preformatGetAssertReq = (getAssert) => {
	getAssert.challenge = base64.toArrayBuffer(getAssert.challenge,true);
    
	// Allow any credential, this will be handled later
	for(let allowCred of getAssert.allowCredentials) {
		allowCred.id = base64.toArrayBuffer(allowCred.id,true);
	}

	return getAssert;
};