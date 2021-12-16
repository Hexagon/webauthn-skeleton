let renderMainContainer = (response) => {
    
    // Update name
    $('#name').text(response.name);
    
    // Clear credential table
    $('#credential-table tbody').html('');

    for(let authenticator of response.authenticators) {        
        $('#credential-table tbody').append("<tr><td><pre class\"pubkey\">" + authenticator.counter + "</pre></td><td><pre class=\"pubkey\">" + authenticator.publicKey + "</pre></td><td><pre class=\"pubkey\">" + new Date(authenticator.created).toLocaleString() + "</pre></td></tr>");
    }

    $('#login-token').hide();
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

let hideTokenWindowTimer = undefined;
let showTokenPopup = (response) => {
    
    // Show token window (will close after token expires)
    $('#login-token').show();
    
    // Update interface
    $('#login-token-expires').text('' + new Date(new Date().getTime()+response.validForSeconds*1000).toLocaleTimeString());
    $('#login-token-link').html("<a href=\""+response.url+"\">"+ response.url + "</a>");

    // Render Qr Code
    $('#login-token-qr').html('');
    QrCreator.render({
        text: response.url,
        radius: 0.0, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H
        fill: '#1c76c5', // foreground color
        background: null, // color or null for transparent
        size: 128 // in pixels
        }, document.querySelector('#login-token-qr'));

    // Schedule hiding token window
    clearTimeout(hideTokenWindowTimer);
    hideTokenWindowTimer = setTimeout(() => {
        $('#login-token').hide();
    }, response.validForSeconds * 1000);

};

let generateToken = () => {
    return fetch('token/generate')
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                showTokenPopup(response);
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