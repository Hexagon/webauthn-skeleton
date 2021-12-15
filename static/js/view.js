let renderMainContainer = (response) => {
    
    // Update name
    $('#name').text(response.name);
    
    // Clear credential table
    $('#credential-table tbody').html('');
    
    // Fill credential table
    if (response.oneTimeToken) {
        let tokenUrl = "token/login/" + response.name + "/" + response.oneTimeToken.token;
        let qrUrl = window.location.origin + "/" + tokenUrl;
        $('#credential-table tbody').append("<tr><td><pre class\"pubkey\">N/A</pre></td><td><pre class=\"pubkey\">One time token <a href="+ qrUrl + ">" + tokenUrl + "</a> <div id=\"qr\">Token expires: " + new Date(response.oneTimeToken.expires).toLocaleTimeString() + " </div></pre></td></tr>");

        QrCreator.render({
            text: qrUrl,
            radius: 0.0, // 0.0 to 0.5
            ecLevel: 'H', // L, M, Q, H
            fill: '#1c76c5', // foreground color
            background: null, // color or null for transparent
            size: 128 // in pixels
          }, document.querySelector('#qr'));
    }
    for(let authenticator of response.authenticators) {
        $('#credential-table tbody').append("<tr><td><pre class\"pubkey\">" + authenticator.counter + "</pre></td><td><pre class=\"pubkey\">" + authenticator.publicKey + "</pre></td></tr>");
    }

    $('#registerContainer').hide();
    $('#mainContainer').show();
};

let loadMainContainer = () => {
    return fetch('personalInfo', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                renderMainContainer(response);
            } else {
                alert(`Error! ${response.message}`)
            }
        })
};

let generateToken = () => {
    return fetch('token/generate')
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                alert('New login token generated, this will be valid for 120 seconds.')
                loadMainContainer();
            } else {
                alert(`Error! ${response.message}`)
            }
        })
};

let checkIfLoggedIn = () => {
    return fetch('isLoggedIn', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                return true
            } else {
                return false
            }
        })
};

$('#button-logout').click(() => {
    fetch('logout', {credentials: 'include'});

    $('#registerContainer').show();
    $('#mainContainer').hide();
})


$('#button-add-credential').click(() => {
    register(undefined, true);
});

$('#button-register').click(() => {
    const username = $('#username')[0].value;
    if(!username) {
        alert('Username is missing!');
    } else {
        register(username);
    }
});

$('#button-login').click(() => {   
    const username = $('#username')[0].value;
    if(!username) {
        alert('Username is missing!');
    } else {
        login(username);
    }
});


$('#button-generate-token').click(() => {   
    generateToken();
});