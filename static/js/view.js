let renderMainContainer = (response) => {
    
    // Update name
    $('#name').text(response.name);
    
    // Clear credential table
    $('#credential-table tbody').html('');

    // Fill credential table
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