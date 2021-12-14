const router = require('@koa/router')();
const database = require('./db');

/* Returns if user is logged in */
router.get('/isLoggedIn', async (ctx, next) => {
    if(!ctx.session.loggedIn) {
        ctx.body = {
            'status': 'failed'
        }
    } else {
        ctx.body = {
            'status': 'ok'
        }
    }
});

/* Logs user out */
router.get('/logout', async (ctx, next) => {
    ctx.session.loggedIn = false;
    ctx.session.username = undefined;
    ctx.body = {
        'status': 'ok'
    }
});

/* Returns personal info and THE SECRET INFORMATION */
router.get('/personalInfo', async (ctx, next) => {
    if(!ctx.session.loggedIn) {
        ctx.body = {
            'status': 'failed',
            'message': 'Access denied'
        }
    } else {
        ctx.body = {
            'status': 'ok',
            'name': database[ctx.session.username].name
        }
    }
});

module.exports = router;