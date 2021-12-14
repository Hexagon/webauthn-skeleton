const router = require('@koa/router')({ prefix: '/webauthn' });
const base64url = require('@hexagon/base64-arraybuffer');
const Fido2     = require('../utils/fido2');
const config    = require('../config');
const crypto    = require('crypto');
const database  = require('./db');

let f2l = new Fido2(config.rpId, config.rpName, undefined);

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
let randomBase64URLBuffer = (len) => {
    len = len || 32;
    let buff = crypto.randomBytes(len);    
    return base64url.encode(buff, true);
}

router.post('/register', async (ctx, next) => {

    if (!ctx.request.body || !ctx.request.body.username || !ctx.request.body.name) {
        ctx.body = {
            'status': 'failed',
            'message': 'Request missing name or username field!'
        }

        return;
    }

    let username = ctx.request.body.username,
        name = username;

    if (database[username] && database[username].registered) {
        ctx.body = {
            'status': 'failed',
            'message': `Username ${username} already exists`
        }

        return;
    }

    let id = randomBase64URLBuffer();

    database[username] = {
        'name': name,
        'registered': false,
        'id': id,
        'authenticators': []
    }

    let challengeMakeCred = await f2l.registration(username, name, id);

    // Transfer challenge and username to session
    ctx.session.challenge = challengeMakeCred.challenge;
    ctx.session.username = username;

    // Respond with credentials
    ctx.body = challengeMakeCred;

});

router.post('/login', async (ctx, next) => {
    if (!ctx.request.body || !ctx.request.body.username) {
        ctx.body = {
            'status': 'failed',
            'message': 'Request missing username field!'
        }

        return;
    }

    let username = ctx.request.body.username;

    if (!database[username] || !database[username].registered) {
        ctx.body = {
            'status': 'failed',
            'message': `User ${username} does not exist!`
        }

        return;
    }

    var assertionOptions = await f2l.login(username);

    // Transfer challenge and username to session
    ctx.session.challenge = assertionOptions.challenge;
    ctx.session.username = username;

    // Pass this, to limit selectable credentials for user... This may be set in response instead, so that
    // all of a users server (public) credentials isn't exposed to anyone
    let allowCredentials = [];
    for (let authr of database[ctx.session.username].authenticators) {
        allowCredentials.push({
            type: 'public-key',
            id: base64url.encode(authr.credId, true),
            transports: ['usb', 'nfc', 'ble', 'internal']
        });
    }

    assertionOptions.allowCredentials = allowCredentials;

    ctx.session.allowCredentials = allowCredentials;

    ctx.body = assertionOptions;
});

router.post('/response', async (ctx, next) => {
    if (!ctx.request.body || !ctx.request.body.id
        || !ctx.request.body.rawId || !ctx.request.body.response
        || !ctx.request.body.type || ctx.request.body.type !== 'public-key') {
            ctx.body = {
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        }

        return;
    }
    let webauthnResp = ctx.request.body;
    if (webauthnResp.response.attestationObject !== undefined) {
        /* This is create cred */
        webauthnResp.rawId = base64url.decode(webauthnResp.rawId, true);
        webauthnResp.response.attestationObject = base64url.decode(webauthnResp.response.attestationObject, true);
        const result = await f2l.attestation(webauthnResp, config.origin, ctx.session.challenge);

        const token = {
            credId: result.authnrData.get("credId"),
            publicKey: result.authnrData.get("credentialPublicKeyPem"),
            counter: result.authnrData.get("counter"),
        };

        database[ctx.session.username].authenticators.push(token);
        database[ctx.session.username].registered = true;

        ctx.session.loggedIn = true;

        return ctx.body = { 'status': 'ok' };


    } else if (webauthnResp.response.authenticatorData !== undefined) {
        /* This is get assertion */
        //result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database[request.session.username].authenticators);
        // add allowCredentials to limit the number of allowed credential for the authentication process. For further details refer to webauthn specs: (https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialrequestoptions-allowcredentials).
        // save the challenge in the session information...
        // send authnOptions to client and pass them in to `navigator.credentials.get()`...
        // get response back from client (clientAssertionResponse)
        webauthnResp.rawId = base64url.decode(webauthnResp.rawId, true);
        webauthnResp.response.userHandle = base64url.decode(webauthnResp.rawId, true);
        let validAuthenticators = database[ctx.session.username].authenticators,
            winningAuthenticator;
        for (let authrIdx in validAuthenticators) {
            let authr = validAuthenticators[authrIdx];
            try {

                var assertionExpectations = {
                    // Remove the following comment if allowCredentials has been added into authnOptions so the credential received will be validate against allowCredentials array.
                    allowCredentials: ctx.session.allowCredentials,
                    challenge: ctx.session.challenge,
                    origin: config.origin,
                    factor: "either",
                    publicKey: authr.publicKey,
                    prevCounter: authr.counter,
                    userHandle: authr.credId
                };

                var result = await f2l.assertion(webauthnResp, assertionExpectations);

                winningAuthenticator = result;

                break;

            } catch (e) {

            }
        }
        // authentication complete!
        if (winningAuthenticator && database[ctx.session.username].registered) {
            ctx.session.loggedIn = true;
            return ctx.body = { 'status': 'ok' };

            // Authentication failed
        } else {
            return ctx.body = {
                'status': 'failed',
                'message': 'Can not authenticate signature!'
            };
        }
    } else {
        return ctx.body = {
            'status': 'failed',
            'message': 'Can not authenticate signature!'
        };
    }
});

module.exports = router;