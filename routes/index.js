var express = require('express');
var passport = require('passport');

var router = express.Router();

// redirect to index -> login
router.get('/', function(req, res) {
  res.render('index.ejs', { title: 'Authentication', message: req.flash('loginMessage') });
});

// process the login form
router.post('/', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
    function(req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
    res.redirect('/');
});

router.get('/signup', function(req, res) {
    res.render('signup.ejs', { title: 'Register', message: req.flash('signupMessage') });
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', { title: 'IceStat',
        user : req.user // get the user out of session and pass to template
    });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
