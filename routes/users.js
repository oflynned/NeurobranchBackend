var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var path = require('path');
var fs = require('fs');
var mime = require('mime');
var candidateSchema = require('../models/Accounts/candidateAccountSchema.js');
var questionSchema = require('../models/Trials/questionSchema');
var requestedCandidate = require('../models/Validation/requestedCandidateSchema');
var verifiedCandidate = require('../models/Validation/verifiedCandidateSchema');
var researcherAccount = require('../models/Accounts/researcherAccountSchema');
var trialData = require('../models/Trials/trialSchema');

var eligibilityData = require('../models/Trials/eligibilitySchema');


var MAX_LENGTH = 200;

function trimString(input, length) {
    var trimmedString = input.substr(0, length);
    return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))) + "...";
}
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
        '<p>' + description + '</p>' + //trimString(description, MAX_LENGTH) + '</p>' +
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
        res.render('mainpage', {
            active_main: "true",
            news_content: container
        });
    }, limit);
}

//top bar
router.get('/mainpage', function (req, res) {
    generateFrontNews(4, res);
});


router.get('/signup', function (req, res) {
    res.render('signup', {
        active_signup: "true"
    });
});
router.get('/verified', function (req, res) {
    res.render('verified', {
        researcher: req.user
    })
});
router.get('/dashboard', ensureAuthenticated, function (req, res) {
    res.render('dashboard', {
        active_dash: "true"
    });
});

router.get('/login', function (req, res) {
    res.render('login', {
        active_login: "true"
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (user) {
            if (err) {
                return next(err);
            }
            console.log("555555555555");
            if (!user) {
                console.log("6666666666");
                return res.redirect('/users/login');

            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                /**
                 * admin authentification strategy relies on the fact
                 * that only we can control certain emails,
                 * every new email has to be unique
                 * thus if we make the first two researcher accounts
                 * these will be the first 2 admin accounts
                 * and no one else can make admin priviliges
                 * as they are hardcoded in
                 * */
                if (req.user.email == "suleaa@tcd.ie") {
                    return res.redirect('/users/moredetails/' + req.user.id);
                }
                else if (req.user.email != "suleaa@tcd.ie") {
                    return res.redirect('/users/dashboard');
                }
            });
        }
    })(req, res, next);
});


/*router.post('/login', passport.authenticate('local', {
 successRedirect: '/',
 successFlash: 'valid credentials',
 failureRedirect: '/users/login',
 failureFlash: 'invalid username or password'
 }));*/

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/users/login');
});

router.get('/cookie-details', function (req, res) {
    res.json(req.user);
});

router.get('/download/:id', function (req, res) {
    trialData.getTrialById(req.params.id, function (err, trialidz) {
        if (err) throw err;
        console.log(trialidz.title);

        fs.writeFile('files/' + trialidz.title + '_neurobranch_' + trialidz.id + '.csv', trialidz.title, function (err) {
            if (err) throw err;


            res.render('download', {
                active_login: "true"
            });
        });
    });
});

router.get('/moredetails/:id', function (req, res) {
    researcherAccount.findAllResearcher(function (err, alres) {
        trialData.findAllTrials(function (err, altrial) {


            res.render('moredetails', {
                active_login: "true",
                alres: alres,
                altrial: altrial
            });
            console.log(altrial);
        });
    });
});

router.get('/trials/:trialid', function (req, res) {
    trialData.getTrialById(req.params.trialid, function (err, trial) {
        if (err) throw err;
        var isResearcher = req.isAuthenticated() ? {show_statistics: "true"} : null;
        trial.datecreated = new Date(parseInt(trial.datecreated));
        questionSchema.getQuestionsByTrialId(req.params.trialid, function (err, questions) {
            if (err) throw err;
            requestedCandidate.getRequestedCandidatesByTrialId(req.params.trialid, function (err, req_candidates) {
                if (err) throw err;
                verifiedCandidate.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, ver_candidates) {
                    if (err) throw err;

                    trial.datestarted = trial.datestarted != 0 ? new Date(parseInt(trial.datestarted)) : null;
                    trial.dateended = trial.dateended != 0 ? new Date(parseInt(trial.dateended)) : null;
                    var fileName = trial.title + "_neurobranch_" + trial.id + ".pdf";
                    /*res.download(fileName);*/

                    res.render('trial', {
                        trial: trial,
                        is_researcher: isResearcher,
                        multimedia: "https://placeholdit.imgix.net/~text?txtsize=33&txt=Placeholder Image&w=500&h=250",
                        active_dash: "true",
                        req_candidates: req_candidates,
                        ver_candidates: ver_candidates,
                        questions: questions,
                        is_created: trial.state == "created" ? true : null,
                        is_active: trial.state == "active" ? true : null,
                        is_cancelled: trial.state == "cancelled" ? true : null,
                        is_ended: trial.state == "ended" ? true : null,
                        can_be_activated: parseInt(ver_candidates.length) >= parseInt(trial.candidatequota) ? true : null
                    });
                });
            });
        });
    });
});
router.get('/candidates/:candidateid', ensureAuthenticated, function (req, res) {
    candidateSchema.getCandidateById(req.params.candidateid, function (err, candidate) {
        if (err) throw err;
        var isResearcher = req.isAuthenticated();
        res.render('candidateprofile', {
            candidate: candidate,
            is_researcher: isResearcher,
            active_dash: "true",
        });
    });
});

router.get('/candidates/:candidateid/:trialid', ensureAuthenticated, function (req, res) {
    candidateSchema.getCandidateById(req.params.candidateid, function (err, candidate) {
        if (err) throw err;
        var isResearcher = req.isAuthenticated() ? true : null;
        eligibilityData.getEligibilityByTrialCandidate(req.params.trialid, req.params.candidateid,
            function (err, eligibility) {
                if (err) throw err;
                res.render('candidateprofile', {
                    candidate: candidate,
                    trialid: req.params.trialid,
                    is_researcher: isResearcher,
                    active_dash: "true",
                    eligibility: eligibility
                });
            });
    });
});
router.get('/create-trial', ensureAuthenticated, function (req, res) {
    res.render('create_trial', {
        active_dash: "true"
    });
});
router.get('/create-question', ensureAuthenticated, function (req, res) {
    res.render('create_question', {
        active_dash: "true"
    });
});

router.get('/settings', ensureAuthenticated, function (req, res) {
    res.render('settings', {
        active_settings: "true"
    });
});
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
            if (err) throw err;
            if (!researcher) return done(null, false, {message: 'Unknown User'});

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
