/**
 * Converts PublicKeyCredential into serialised JSON
 * @param  {Object} pubKeyCred
 * @return {Object}            - JSON encoded publicKeyCredential
 */
var publicKeyCredentialToJSON = (pubKeyCred) => {
    /* ----- DO NOT MODIFY THIS CODE ----- */
    if(pubKeyCred instanceof Array) {
        let arr = [];
        for(let i of pubKeyCred)
            arr.push(publicKeyCredentialToJSON(i));

        return arr
    }

    if(pubKeyCred instanceof ArrayBuffer) {
        return base64.encode(pubKeyCred,true)
    }

    if(pubKeyCred instanceof Object) {
        let obj = {};

        for (let key in pubKeyCred) {
            obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
        }

        return obj
    }

    return pubKeyCred
}

/**
 * Decodes arrayBuffer required fields.
 */
var preformatMakeCredReq = (makeCredReq) => {
    makeCredReq.challenge = base64.decode(makeCredReq.challenge,true);
    makeCredReq.user.id = base64.decode(makeCredReq.user.id,true);

    // Decode id of each excludeCredentials
    if (makeCredReq.excludeCredentials) {
        makeCredReq.excludeCredentials = makeCredReq.excludeCredentials.map((e) => { return { id: base64.decode(e.id, true), type: e.type };});
    }

    return makeCredReq
}

/**
 * Decodes arrayBuffer required fields.
 */
var preformatGetAssertReq = (getAssert) => {
    getAssert.challenge = base64.decode(getAssert.challenge,true);
    
    // Allow any credential, this will be handled later
    for(let allowCred of getAssert.allowCredentials) {
        allowCred.id = base64.decode(allowCred.id,true);
    }

    return getAssert
}