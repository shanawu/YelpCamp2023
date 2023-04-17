const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utilities/wrapAsync');
const users = require('../controllers/users');


router.route('/register')
    .get(users.registerPage)
    .post(wrapAsync(users.createUser))

router.route('/login')
    .get(users.loginPage)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.userLogined)

router.get('/logout', users.logout);

module.exports = router;