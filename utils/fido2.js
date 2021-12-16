const { Fido2Lib } = require("fido2-lib");

const base64url = require("@hexagon/base64-arraybuffer");

class Fido2 {
	constructor(rpId, rpName, rpIcon, timeout) {
		this.f2l = new Fido2Lib({
			timeout,
			rpId,
			rpName,
			challengeSize: 128,
			attestation: "none",
			cryptoParams: [-7, -257],
			authenticatorAttachment: undefined, // ["platform", "cross-platform"]
			authenticatorRequireResidentKey: false,
			authenticatorUserVerification: "preferred"
		});
	}

	async registration(username, displayName, id) {
		let registrationOptions = await this.f2l.attestationOptions();

		// make sure to add registrationOptions.user.id
		registrationOptions.user = {
			id: id,
			name: username,
			displayName: displayName
		};

		registrationOptions.status = "ok";

		registrationOptions.challenge = base64url.encode(registrationOptions.challenge, true);

		return registrationOptions;
	}

	async attestation(clientAttestationResponse, origin, challenge) {
		let attestationExpectations = {
			challenge: challenge,
			origin: origin,
			factor: "either"
		};
		let regResult = await this.f2l.attestationResult(clientAttestationResponse, attestationExpectations); // will throw on error
		return regResult;
	}

	async login() {
		let assertionOptions = await this.f2l.assertionOptions();
		assertionOptions.challenge = base64url.encode(assertionOptions.challenge, true);
		assertionOptions.status = "ok";
		return assertionOptions;
	}

	async assertion(assertionResult, expectedAssertionResult) {
		let authnResult = await this.f2l.assertionResult(assertionResult, expectedAssertionResult); // will throw on error
		return authnResult;
	}
}

module.exports = Fido2;