var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var researcherAccount = require('../models/Accounts/researcherAccountSchema');
var trialData = require('../models/Trials/trialSchema');

var MAX_LENGTH = 200;

function trimString(input, length) {
    var trimmedString = input.substr(0, length);
    return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))) + "...";
}

//main
router.get('/index', function (req, res) {
    generateFrontNews(4, res);
});

function generateRow(rowId, content) {
    return '<div class="row flex-row" id="' + rowId + '">' +
        content +
        '</div>'
}

function generateTile(trialName, description, image, trialid) {
    return '<div class="col-md-3">' +
        '<div class="thumbnail">' +
        '<img src="' + image + '">' +
        '<div class="caption">' +
        '<h4><a href="trials/' + trialid + '">' + trialName + '</a></h4>' +
        '<p>' + trimString(description, MAX_LENGTH) + '</p>' +
        '</div>' +
        '</div>' +
        '</div>'
}

function generateFrontNews(limit, res) {
    trialData.getTrials(function (err, data) {
        var element = "";
        var rowId = 0;
        var container = "";
        var i = 0;
        for (i; i < data.length; i++) {
            if (i % 4 == 0 && i > 0) {
                container += generateRow(rowId, element);
                rowId++;
                element = "";
            }
            element += generateTile(data[i]['title'], data[i]['description'], null, data[i]['_id']);

            if (i == data.length - 1)
                container += generateRow(rowId, element);
        }
        res.render('index', {
            active_main: "true",
            news_content: container
        });
    }, limit);
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

//login
router.get('/login', function (req, res) {
    res.render('login', {
        active_login: "true"
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login'
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

router.get('/trials/:trialid', function (req, res) {
    trialData.getTrialById(req.params.trialid, function (err, trialAttributes) {
        if (err) {
            throw err;
        }

        //convert inclusion
        var start = new Date(0); // The 0 there is the key, which sets the date to the inclusion
        start.setUTCSeconds(trialAttributes.starttime);

        var end = new Date(0); // The 0 there is the key, which sets the date to the inclusion
        end.setUTCSeconds(trialAttributes.endtime);

        res.render('trial', {
            trialName: trialAttributes.trialname,
            trialDescription: trialAttributes.description,
            trialType: trialAttributes.trialtype,
            organisation: trialAttributes.organisation,
            specialisation: trialAttributes.specialisation,
            startTime: start,
            endTime: end,
            notificationFrequency: trialAttributes.notificationfrequency,
            imageResource: trialAttributes.imageresource,
            active_dash: "true"
        });
    })
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
router.get('/goals', function (req, res) {
    res.render('goals');
});

router.get('/aboutneurobranch', function (req, res) {
    res.render('aboutneurobranch');
});

router.get('/aboutglassbyte', function (req, res) {
    res.render('aboutglassbyte');
});

router.get('/faq', function (req, res) {
    res.render('faq');
});

router.get('/support', function (req, res) {
    res.render('support');
});

router.get('/termsofuse', function (req, res) {
    res.render('termsofuse');
});

router.get('/cookiepolicy', function (req, res) {
    res.render('cookiepolicy');
});

router.get('/privacypolicy', function (req, res) {
    res.render('privacypolicy');
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        researcherAccount.getResearcherByUsername(username, function (err, researcher) {
            console.log(researcher);

            if (err) throw err;
            if (!researcher) return done(null, false, { message: 'Unknown User'} );

            researcherAccount.comparePasswords(password, researcher.password, function (err, isMatch) {
                if (err) throw err;
                return isMatch ? done(null, researcher) : done(null, false, {message: 'Invalid password'});
            });
        });
    })
);

passport.serializeUser(function (researcher, done) {
    done(null, researcher.id);
});

passport.deserializeUser(function (id, done) {
    researcherAccount.getResearcherById(id, function (err, researcher) {
        done(err, researcher);
    });
});

function ensureAuthenticated(req, res, next) {
    return req.isAuthenticated() ? next() : res.redirect('/');
}

module.exports = router;
