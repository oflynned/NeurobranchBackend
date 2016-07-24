var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var trialData = require('../models/trialdata');

var MAX_LENGTH = 200;

function trimString(input, length) {
    var trimmedString = input.substr(0, length);
    return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))) + "...";
}

//main
router.get('/mainpage', function (req, res) {
    generateFrontNews(res);
});

function generateRow(rowId, content) {
    return '<div class="row flex-row" id="' + rowId + '">' +
            content +
            '</div>'
}

function generateTile(trialName, description, image) {
    return '<div class="col-md-3">' +
        '<div class="thumbnail">' +
        '<img src="' + image + '">' +
        '<div class="caption">' +
        '<h4>' + trialName + '</h4>' +
        '<p>' + trimString(description, MAX_LENGTH) + '</p>' +
        '</div>' +
        '</div>' +
        '</div>'
}

function generateFrontNews(res) {
    trialData.getRandomTrial(8, function(err, data) {
        var element = "";
        var rowId = 0;
        var container = "";
        var i=0;
        for (i; i < data.length; i++) {
            if(i%4 == 0 && i>0) {
                container += generateRow(rowId, element);
                rowId++;
                element = "";
            }
            element += generateTile(data[i]['trialname'], data[i]['description'], data[i]['imageresource'], data[i]['_id']);

            if(i==data.length-1)
                container += generateRow(rowId, element);
        }
        res.render('mainpage', {
            active_main: "true",
            news_content: container
        });
    })
}

//news
router.get('/news', function (req, res) {
    res.render('news', {
        news_section_1: "section 1",
        news_section_2: "section 2",
        news_section_3: "section 3",
        active_news: "true"
    });
});

//sign up get
router.get('/signup', function (req, res) {
    res.render('signup', {
        active_signup: "true"
    });
});

//sign up post
router.post('/signup', function (req, res) {
    var forename = req.body.forename;
    var surname = req.body.surname;
    var username = req.body.username;
    var organisation = req.body.organisation;
    var email = req.body.email;
    var conf_email = req.body.conf_email;
    var password = req.body.password;
    var conf_pass = req.body.conf_pass;

    // Validation
    req.checkBody("username", "Username is required").notEmpty();

    req.checkBody("forename", 'Forename is required').notEmpty();
    req.checkBody("surname", 'Surname is required').notEmpty();

    req.checkBody("email", 'Email is required').notEmpty();
    req.checkBody("conf_email", 'Email is not valid').equals(req.body.email);

    req.checkBody("organisation", "Organisation is required").notEmpty();

    req.checkBody("password", 'Password is required').notEmpty();
    req.checkBody("conf_pass", 'Passwords do not match').equals(req.body.conf_pass);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('signup', {
            errors: errors
        });
    } else {
        var newUser = new User({
            forename: forename,
            surname: surname,
            username: username,
            organisation: organisation,
            password: password,
            email: email
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });
        res.redirect('/users/login');
    }
});

//login
router.get('/login', function (req, res) {
    res.render('login', {
        active_login: "true"
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/users/login');
});

//dashboard
//overview
router.get('/dashboard', ensureAuthenticated, function (req, res) {
    res.render('dashboard', {
        active_dash: "true"
    });
});

//create trial
router.get('/create_trial', ensureAuthenticated, function (req, res) {
    res.render('create_trial', {
        active_dash: "true"
    });
});

//create questions
router.get('/create_question', ensureAuthenticated, function (req, res) {
    res.render('create_question', {
        active_dash: "true"
    });
});

//settings
router.get('/settings', ensureAuthenticated, function (req, res) {
    res.render('settings', {
        active_settings: "true"
    });
});

//help
router.get('/help', ensureAuthenticated, function (req, res) {
    res.render('help', {
        active_dash: "true"
    });
});

//footer links
router.get('/goals', function(req, res) {
    res.render('goals');
});

router.get('/aboutneurobranch', function(req, res) {
    res.render('aboutneurobranch');
});

router.get('/aboutglassbyte', function(req, res) {
    res.render('aboutglassbyte');
});

router.get('/faq', function(req, res) {
    res.render('faq');
});

router.get('/support', function(req, res) {
    res.render('support');
});

router.get('/termsofuse', function(req, res) {
    res.render('termsofuse');
});

router.get('/cookiepolicy', function(req, res) {
    res.render('cookiepolicy');
});

router.get('/privacypolicy', function(req, res) {
    res.render('privacypolicy');
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;
