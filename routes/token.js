const express   = require('express');
const config = require('../config');
const token     = require('../utils/token');
const router    = express.Router();
const username  = require('../utils/username');
const database  = require('./db');

router.get('/login/:userName/:oneTimeToken', async (request, response) => {

    // Check that token exists
    if(!request.params.oneTimeToken) {
        return response.json({
            'status': 'failed',
            'message': 'Invalid token'
        });
    }

    // Check username
    let usernameClean = username.clean(request.params.userName);
    if(!usernameClean) {
        return response.json({
            'status': 'failed',
            'message': 'Invalid user'
        });
    }

    // Check that user exists
    if(!database[usernameClean] || !database[usernameClean].registered) {
        return response.json({
            'status': 'failed',
            'message': `User ${usernameClean} does not exist!`
        });
    }

    // Check that token validator exists
    let tokenValidator = database[usernameClean].oneTimeToken;
    if (!tokenValidator) {
        return response.json({
            'status': 'failed',
            'message': `Invalid token!`
        });
    }

    // Validate token
    if (token.validate(usernameClean, request.params.oneTimeToken, tokenValidator )) {

        // Log in user
        request.session.username  = usernameClean;
        request.session.loggedIn = true;

        // Success
        return response.redirect(config.baseUrl);
    } else {
        return response.json({
            'status': 'failed',
            'message': `Invalid token!`
        })
    }

});

router.get('/generate', async (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed'
        })
    } else {

        let validForSeconds = 120,
            tokenValidator = token.generate(request.session.username,validForSeconds*1000),
            tokenEncoded = token.encode(tokenValidator.token);

        database[request.session.username].oneTimeToken = tokenValidator;

        response.json({
            'status': 'ok',
            'token': tokenEncoded,
            'validForSeconds': validForSeconds,
            'url': config.baseUrl + '/token/login/' + request.session.username + '/' + tokenEncoded
        })
    }
});

module.exports = router;
