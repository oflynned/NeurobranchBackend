var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var path = require('path');
var fs = require('fs');
var http = require('http');
var mime = require('mime');

var request = require('request');
var candidateSchema = require('../models/Accounts/candidateAccountSchema.js');
var questionSchema = require('../models/Trials/questionSchema');
var requestedCandidate = require('../models/Validation/requestedCandidateSchema');
var verifiedCandidate = require('../models/Validation/verifiedCandidateSchema');
var researcherAccount = require('../models/Accounts/researcherAccountSchema');
var trialData = require('../models/Trials/trialSchema');
var responseData = require('../models/Trials/responseSchema');

//top bar
router.get('/mainpage', function (req, res) {
    res.render('mainpage', {
        active_main: "true"
    });
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
            if (!user) {
                return res.redirect('/users/login');
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/users/dashboard');
            });
        }
        else {
            return res.redirect('/users/login');
        }
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/users/login');
});

router.get('/moredetails/:id', function (req, res) {
    researcherAccount.findAllResearcher(function (err, alres) {
        trialData.findAllTrials(function (err, altrial) {
            res.render('moredetails', {
                active_login: "true",
                alres: alres,
                altrial: altrial
            });
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
                responseData.getResponseByTrialId(req.params.trialid, function (err) {
                    if (err) throw err;
                    verifiedCandidate.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, ver_candidates) {
                        if (err) throw err;

                        trial.datestarted = trial.datestarted != 0 ? new Date(parseInt(trial.datestarted)) : null;
                        trial.dateended = trial.dateended != 0 ? new Date(parseInt(trial.dateended)) : null;
                        trial.state = trial.state.replace(/\b\w/g, l => l.toUpperCase());

                        res.render('trial', {
                            trial: trial,
                            is_researcher: isResearcher,
                            active_dash: true,
                            req_candidates: req_candidates,
                            ver_candidates: ver_candidates,
                            questions: questions,
                            is_created: trial.state == "Created" ? "true" : null,
                            is_active: trial.state == "Active" ? "true" : null,
                            is_ended: trial.state == "Ended" ? "true" : null,
                            can_be_activated: parseInt(ver_candidates.length) >= parseInt(trial.candidatequota) ? "true" : null
                        });
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
        res.render('candidateprofile', {
            candidate: candidate,
            trialid: req.params.trialid,
            is_researcher: isResearcher,
            active_dash: "true"
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
