let loadMainContainer = () => {
    return fetch('personalInfo', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                $('#name').text(response.name);

                $('#registerContainer').hide();
                $('#mainContainer').show();
            } else {
                alert(`Error! ${response.message}`)
            }
        })
}

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
}

$('#logoutButton').click(() => {
    fetch('logout', {credentials: 'include'});

    $('#registerContainer').show();
    $('#mainContainer').hide();
})


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