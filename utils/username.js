// Clean username
module.exports = { clean: function (username) {
    try {
        // Allow only certain characters
        var usernameClean = username.replace(/[^a-z0-9\-_]/gi,'');

        // Make lower case
        usernameClean = usernameClean.toLowerCase();

        return usernameClean;
    } catch (e) {
        return;
    }
}};