import { base64, Fido2Lib } from "../deps.ts";

interface IAssertionExpectations {
	allowCredentials: string;
	challenge: string;
	origin: string;
	factor: string;
	publicKey: string;
	prevCounter: number;
	userHandle: string;
}
class Fido2 {

	f2l: any;

	constructor(rpId : string, rpName : string, rpIcon : string | undefined, timeout: number) {
		this.f2l = new Fido2Lib({
			timeout,
			rpId,
			rpName,
			rpIcon: rpIcon,
			challengeSize: 128,
			attestation: "direct",
			cryptoParams: [-7, -257],
			authenticatorAttachment: undefined, // ["platform", "cross-platform"]
			authenticatorRequireResidentKey: false,
			authenticatorUserVerification: "preferred"
		});
	}

	async registration(username : string, displayName : string, id : string) {
		const registrationOptions = await this.f2l.attestationOptions();

		// make sure to add registrationOptions.user.id
		registrationOptions.user = {
			id: id,
			name: username,
			displayName: displayName
		};

		registrationOptions.status = "ok";

		registrationOptions.challenge = base64.fromArrayBuffer(registrationOptions.challenge, true);

		return registrationOptions;
	}

	async attestation(clientAttestationResponse : string, origin : string, challenge : string) {
		const attestationExpectations = {
			challenge: challenge,
			origin: origin,
			factor: "either"
		};
		const regResult = await this.f2l.attestationResult(clientAttestationResponse, attestationExpectations); // will throw on error
		return regResult;
	}

	async login() {
		const assertionOptions = await this.f2l.assertionOptions();
		assertionOptions.challenge = base64.fromArrayBuffer(assertionOptions.challenge, true);
		assertionOptions.status = "ok";
		return assertionOptions;
	}

	async assertion(assertionResult : string, expectedAssertionResult : IAssertionExpectations) {
		const authnResult = await this.f2l.assertionResult(assertionResult, expectedAssertionResult); // will throw on error
		return authnResult;
	}
}

export { Fido2 };
export type { IAssertionExpectations };