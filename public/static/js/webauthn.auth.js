/* global base64, loadMainContainer, preformatMakeCredReq, preformatGetAssertReq, publicKeyCredentialToJSON */
/* exported register, login */

let getMakeCredentialsChallenge = (formBody, additional) => {
	return fetch(additional ? "webauthn/add" : "webauthn/register", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(formBody)
	})
		.then((response) => response.json())
		.then((response) => {
			if(response.status !== "ok")
				throw new Error(`Server responed with error. The message is: ${response.message}`);

			return response;
		});
};

let sendWebAuthnResponse = (body) => {
	return fetch("webauthn/response", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	})
		.then((response) => response.json())
		.then((response) => {
			if(response.status !== "ok")
				throw new Error(`Server responed with error. The message is: ${response.message}`);

			return response;
		});
};

let getGetAssertionChallenge = (formBody) => {
	return fetch("webauthn/login", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(formBody)
	})
		.then((response) => response.json())
		.then((response) => {
			if(response.status !== "ok")
				throw new Error(`Server responed with error. The message is: ${response.message}`);
			return response;
		});
};

/* Handle for register form submission */
function register (username, additional) {
    
	let name = username;

	getMakeCredentialsChallenge({username, name}, additional)
		.then((response) => {
			let publicKey = preformatMakeCredReq(response);
			return navigator.credentials.create({ publicKey });
		})
		.then((response) => {
			let transports = response.response.getTransports ? response.response.getTransports() : undefined,
				makeCredResponse = {
				id: response.id,
				rawId: base64.fromArrayBuffer(response.rawId,true),
				transports: transports,
				response: {
					attestationObject: base64.fromArrayBuffer(response.response.attestationObject,true),
					clientDataJSON: base64.fromArrayBuffer(response.response.clientDataJSON,true)
				},
				type: response.type
			};
			return sendWebAuthnResponse(makeCredResponse);
		})
		.then((response) => {
			if(response.status === "ok") {
				loadMainContainer();   
			} else {
				alert(`Server responed with error. The message is: ${response.message}`);
			}
		})
		.catch((error) => alert(error));
}

/* Handler for login form submission */
function login(username) {
	getGetAssertionChallenge({username})
		.then((response) => {
			let publicKey = preformatGetAssertReq(response);
			return navigator.credentials.get( { publicKey } );
		})
		.then((response) => {
			let getAssertionResponse = publicKeyCredentialToJSON(response);
			return sendWebAuthnResponse(getAssertionResponse);
		})
		.then((response) => {
			if(response.status === "ok") {
				loadMainContainer();   
			} else {
				alert(`Server responed with error. The message is: ${response.message}`);
			}
		})
		.catch((error) => alert(error));
}