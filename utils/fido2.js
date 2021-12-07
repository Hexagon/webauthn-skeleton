const { Fido2Lib } = require("fido2-lib");

const base64url = require("@hexagon/base64-arraybuffer");

class Fido2 {
    constructor(rpId, rpName, rpIcon) {
        // could also use one or more of the options below,
        // which just makes the options calls easier later on:
        this.f2l = new Fido2Lib({
            timeout: 60000,
            rpId,
            rpName,
            //rpIcon: "https://example.com/logo.png",
            challengeSize: 128,
            attestation: "none",
            cryptoParams: [-7, -257],
            authenticatorAttachment: undefined, // ["platform", "cross-platform"]
            authenticatorRequireResidentKey: false,
            authenticatorUserVerification: "preferred"
        });
    }

    async registration(username, displayName, id) {
        var registrationOptions = await this.f2l.attestationOptions();

        // make sure to add registrationOptions.user.id
        registrationOptions.user = {
            id: id,
            name: username,
            displayName: displayName
        };

        registrationOptions.status = 'ok';

        registrationOptions.challenge = base64url.encode(registrationOptions.challenge, true);

        return registrationOptions;
    }

    async attestation(clientAttestationResponse, origin, challenge) {
        var attestationExpectations = {
            challenge: challenge,
            origin: origin,
            factor: "either"
        };
        var regResult = await this.f2l.attestationResult(clientAttestationResponse, attestationExpectations); // will throw on error

        // registration complete!
        // save publicKey and counter from regResult to user's info for future authentication calls
        return regResult;

    }

    async login(username) {
        let assertionOptions = await this.f2l.assertionOptions();
        assertionOptions.challenge = base64url.encode(assertionOptions.challenge, true);
        assertionOptions.status = 'ok';
        return assertionOptions;
    }

    async assertion(assertionResult, expectedAssertionResult) {
        var authnResult = await this.f2l.assertionResult(assertionResult, expectedAssertionResult); // will throw on error
        return authnResult;
    }
}

module.exports = Fido2;