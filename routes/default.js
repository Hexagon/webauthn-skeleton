const express  = require('express');
const router   = express.Router();
const database = require('./db');
const token    = require('../utils/token');

/* Returns if user is logged in */
router.get('/isLoggedIn', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed'
        })
    } else {
        response.json({
            'status': 'ok'
        })
    }
})

/* Logs user out */
router.get('/logout', (request, response) => {
    request.session.loggedIn = false;
    request.session.username = undefined;

    response.json({
        'status': 'ok'
    })
})

/* Returns personal info and THE SECRET INFORMATION */
router.get('/personalInfo', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed',
            'message': 'Access denied'
        })
    } else {
        response.json({
            'status': 'ok',
            'authenticators': database[request.session.username].authenticators,
            'name': database[request.session.username].name,
            'oneTimeToken': database[request.session.username].oneTimeToken ? token.encode(database[request.session.username].oneTimeToken.token) : undefined
        })
    }
})

module.exports = router;
