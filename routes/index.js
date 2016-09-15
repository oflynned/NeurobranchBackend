var express = require('express');
var router = express.Router();
var assert = require('assert');

var Globals = require("./Globals.js");

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.createConnection('localhost:27017/neurobranch_db');

var trialSchema = require('../models/Trials/trialSchema');
var trialData = mongoose.model('Trials', trialSchema);
var requestedCandidatesSchema = require('../models/Validation/requestedCandidateSchema');
var researcherData = require('../models/Accounts/researcherAccountSchema');
var requestedCandidatesData = mongoose.model('RequestedCandidates', requestedCandidatesSchema);

var MAX_LENGTH = 300;

//dashboard
/*router.post('/reject_can/:id',function(req, res, next){
 console.log("success");
 var id = req.body.userid;

 requestedCandidatesData.removeRequestedCandidate(req.params.userid , function (err, rej) {
 if (err) throw err;

 });
 res.redirect('/users/trials/'+id);

 });*/

router.get('/users/dashboard', ensureAuthenticated, function (req, res) {
    generateDashboard(req.user.id, res);
});
router.get('/users/notifications', ensureAuthenticated, function (req, res) {
    res.render('notifications',
        {
            user: req.user,
            active_dash: "true"
        });
});
router.get('/users/create-trial', ensureAuthenticated, function (req, res) {
    researcherData.getResearcherById(req.params.id, function (err, isver) {
        if (err) throw err;

        console.log("1");
        console.log(req.user);
        console.log(req.user.isverified);

        res.render('create_trial',
            {

                user: req.user,
                active_dash: "true",
                is_ver:req.user.isverified
            });
    });
});
router.get('/users/verify-candidates', ensureAuthenticated, function (req, res) {

});
router.get('/users/view-candidates', ensureAuthenticated, function (req, res) {

});

router.get('/users/settings', ensureAuthenticated, function (req, res) {
    res.render('settings',
        {
            user: req.user,
            active_dash: "true"
        });
});
router.get('/users/help', function (req, res) {
    res.render('help', {
        user: req.user,
        active_dash: "true"
    })
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}

function trimString(input, length) {
    if (input != null) {
        var trimmedString = input.substr(0, length);
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
        return trimmedString.charAt(trimmedString.length - 1) == "." ? trimmedString + ".." : trimmedString + "...";
    }
    return "";
}
function generateRow(id, content) {
    return '<div class="row flex-row" id="' + id + '">' + content + '</div>';
}
function generateTile(trialName, description, image, trialid) {
    return '<div class="col-sm-4 col-md-3 col-xl-2">' +
        '<div class="thumbnail">' +
        '<img src="' + image + '">' +
        '<div class="caption">' +
        '<h4><a href="trials/' + trialid + '">' + trialName + '</a></h4>' +
        '<p>' + trimString(description, MAX_LENGTH) + '</p>' +
        '</div>' +
        '</div>' +
        '</div>'
}
function generateDashboard(researcherId, res) {
    trialData.getTrialsByResearcherId(researcherId, function (err, data) {
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
            element += generateTile(data[i]['title'], data[i]['briefdescription'],
                "https://placeholdit.imgix.net/~text?txtsize=33&txt=Placeholder Image " + (i + 1) + "&w=500&h=250", data[i]['_id']);

            if (i == data.length - 1)
                container += generateRow(rowId, element);
        }
        res.render('dashboard', {
            active_dash: "true",
            content: container
        });
    });
}

module.exports = router;