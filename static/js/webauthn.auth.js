'use strict';

let getMakeCredentialsChallenge = (formBody) => {
    return fetch('webauthn/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

let sendWebAuthnResponse = (body) => {
    return fetch('webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

let getGetAssertionChallenge = (formBody) => {
    return fetch('webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

/* Handle for register form submission */
function register (username) {
    
    let name = username;

    getMakeCredentialsChallenge({username, name})
        .then((response) => {
            let publicKey = preformatMakeCredReq(response);
            return navigator.credentials.create({ publicKey });
        })
        .then((response) => {
            let makeCredResponse = {
                id: response.id,
                rawId: base64.encode(response.rawId,true),
                response: {
                    attestationObject: base64.encode(response.response.attestationObject,true),
                    clientDataJSON: base64.encode(response.response.clientDataJSON,true)
                },
                type: response.type
            };
            return sendWebAuthnResponse(makeCredResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
}

/* Handle for login form submission */
function login(username) {
    getGetAssertionChallenge({username})
        .then((response) => {
            let publicKey = preformatGetAssertReq(response);
            return navigator.credentials.get( { publicKey } );
        })
        .then((response) => {
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            return sendWebAuthnResponse(getAssertionResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
}

/* Handle for register form submission */
function submit(action) {
    event.preventDefault();

    let username = $('#username')[0].value;
    
    if(!username) {
        alert('Username is missing!')
        return
    }

    if (action === "register") {
        register(username);
    } else {
        login(username);
    }
}
$('#button-register').click(() => {   
    submit("register");
});
$('#button-login').click(() => {   
    submit("login");
});