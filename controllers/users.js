const User = require('../models/user');

module.exports.registerPage = (req, res) => {
    res.render('users/register')
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Congratulations! You are successfully signed up!');
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}

module.exports.loginPage = (req, res) => {
    res.render('users/login');
}

module.exports.userLogined = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res, next) => {
    req.logout( err => {
        if (err) return next(err);
        req.flash('success', 'You have successfully logged out');
        res.redirect('/campgrounds')
    })
}