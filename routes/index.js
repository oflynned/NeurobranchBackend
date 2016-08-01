var express = require('express');
var router = express.Router();
var assert = require('assert');

var Globals = require("./Globals.js");
var multer = require('multer');
var upload = multer({dest: 'public/uploads/'});

var candidateAccountSchema = require('../models/Accounts/candidateAccountSchema');
var conditionsSchema = require('../models/Accounts/conditionsSchema');
var epochSchema = require('../models/Trials/epochSchema');
var exclusionSchema = require('../models/Trials/exclusionSchema');
var inclusionSchema = require('../models/Trials/inclusionSchema');
var requestedCandidatesSchema = require('../models/Validation/requestedCandidateSchema');
var researcherAccountsSchema = require('../models/Accounts/researcherAccountSchema');
var researcherSchema = require('../models/Trials/researcherSchema');
var responseSchema = require('../models/Trials/responseSchema');
var trialSchema = require('../models/Trials/trialSchema');
var verifiedCandidatesSchema = require('../models/Validation/verifiedCandidateSchema');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.createConnection('localhost:27017/neurobranch_db');

//schemas
var candidateAccount = mongoose.model('CandidateAccounts', candidateAccountSchema);
var researcherAccount = mongoose.model('ResearcherAccounts', researcherAccountsSchema);
var conditionsData = mongoose.model('Conditions', conditionsSchema);

/*
 var epochData = mongoose.model('' , epochSchema);
 var exclusionsData = mongoose.model('' , exclusionSchema);
 var inclusionsData = mongoose.model('' , inclusionSchema);
 var requestedCandidatesData = mongoose.model('' , requestedCandidatesSchema);
 var researcherAccountsData = mongoose.model('' , researcherAccountsSchema);
 var researcherData = mongoose.model('' , researcherSchema);
 var responseData = mongoose.model('' , responseSchema);
 var trialData = mongoose.model('' , trialSchema);
 var verifiedCandidatesData = mongoose.model('' , verifiedCandidatesSchema);*/

// debug functions!

// candidates
router.get('/debug/create-candidate', function () {
    var mockData = {
        email: Date.now() + '@email.com',
        password: 'test'
    };
    candidateAccount.createCandidate(new candidateAccount(mockData));
});

router.get('/debug/get-candidates', function (req, res) {
    candidateAccount.getCandidates(function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

router.get('/debug/get-candidates/:id', function (req, res) {
    console.log(req.params);
    candidateAccount.getCandidateById(req.params.id, function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

// researchers
router.get('/debug/create-researcher', function () {
    var mockData = {
        forename: Date.now(),
        surname: Date.now(),
        username: Date.now(),
        email: Date.now(),
        password: Date.now(),
        institute: Date.now(),
        datecreated: Date.now()
    };
    researcherAccount.createResearcher(new researcherAccount(mockData));
});

router.get('/debug/get-researchers', function (req, res) {
    researcherAccount.getResearcher(function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

router.get('/debug/get-researchers/:id', function (req, res) {
    console.log(req.params);
    researcherAccount.getResearcherById(req.params.id, function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

// conditions
router.get('/debug/create-condition/:count', function (req) {
    var conditions={};
    for(var i=0; i<req.params.count; i++) {
        var item = i;
        conditions["condition" + item] = item;
    }

    var mockData = {
        userid: '579f8f80863639bf202c6f42',
        conditions
    };
    console.log(mockData);
    //conditionsData.createCondition(new conditionsData(mockData));
});

router.get('/debug/edit-condition', function () {

});

router.get('/debug/get-conditions', function (req, res) {
    conditionsData.getConditions(function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

router.get('/debug/get-conditions/:id', function (req, res) {
    console.log(req.params);
    conditionsData.getConditionById(req.params.id, function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

//-------------------------------------------------------------------
// unsanitized

//dashboard
router.get('/users/dashboard', function (req, res) {
    generateDashboard(res);
});

//display username in create_trial
router.get('/users/notifications', ensureAuthenticated, function (req, res) {
    res.render('notifications',
        {
            user: req.user,
            active_dash: "true"
        });
});

//display username in create_trial
router.get('/users/create_trial', ensureAuthenticated, function (req, res) {
    res.render('create_trial',
        {
            user: req.user,
            active_dash: "true"
        });
});

//insert for trials//
router.post('/insert', function (req, res, err) {

    var item = {
        questionrelation: req.body._id,
        trialname: req.body.trialname,
        trialid: req.body.trialid,
        description: req.body.description,
        trialtype: req.body.trialtype,
        researcher: {
            researchgroup: req.body.researchgroup,
            researchername: req.body.researchername
        },
        organisation: req.body.organisation,
        specialisation: req.body.specialisation,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        timeperiodfrequency: req.body.timeperiodfrequency,
        notificationfrequency: req.body.notificationfrequency,
        imageresource: req.body.imageresource,
        prerequisites: {
            minage: req.body.minage,
            condition: req.body.condition,
            prereqtype: req.body.prereqtype
        }
    };

    var itemq = {
        questions: {
            trialrelation: item.trialname,
            question: req.body.question,
            questiontype: req.body.questiontype,
            options: {
                answer: req.body.answer
            }
        }
    };

    var itemr = {
        trialid: itemq.trialrelation,
        epochid: req.body.epochid,
        candidateid: req.body.candidateid,
        response: [{type: String}]
    };

    var rdata = new ResponseData(itemr);
    rdata.save();

    var qdata = new QuestionData(itemq);
    qdata.save();

    var data = new UserData(item);
    data.save(function (err) {
        if (err) return __handleError(err);

        var question1 = new QuestionData({
            trialrelation: data._id
        });
        question1.save();
    });
    res.redirect('/users/dashboard');
});

//display username in create_question
router.get('/users/create_question', ensureAuthenticated, function (req, res) {
    UserData.find()
        .then(function (doc) {
            res.render('create_question',
                {
                    items: doc,
                    user: req.user
                });
        });
});

//display username in settings
router.get('/users/settings', ensureAuthenticated, function (req, res) {
    res.render('settings',
        {
            user: req.user,
            active_dash: "true"
        });
});

//help
router.get('/user/help', ensureAuthenticated, function (req, res) {
    res.render('help', {
        user: req.user,
        active_dash: "true"
    })
});

//load trial data
router.get('/get-data', function (req, res, next) {
    UserData.find()
        .then(function (doc) {
            res.render('create_trial',
                {
                    items: doc,
                    user: req.user
                });
        });
});

//Load question data
router.get('/get-data-q', function (req, res, next) {
    QuestionData.find()
        .then(function (docq) {
            res.render('create_trial', {
                items: docq,
                name: req.user.name,
                username: req.user.username
            });
        });
});

///question update
router.post('/updateq', function (req, res, next) {
    var idq = req.body.idq;

    QuestionData.findById(idq, function (err, docq) {
        if (err) {
            console.error('error, no entry found');
            res.redirect('/');
        }
        docq.question = req.body.question;
        docq.questiontype = req.body.questiontype;
        docq.answer = req.body.answer;
        docq.save();
    });
    res.redirect('/');
});

router.post('/update', function (req, res, next) {

    var id = req.body.id;

    UserData.findById(id, function (err, doc) {
        if (err) {
            console.error('error, no entry found');
            res.redirect('/');
        }

        doc.trialname = req.body.trialname;
        doc.trialid = req.body.trialid;
        doc.description = req.body.description;
        doc.trialtype = req.body.trialtype;
        doc.researcher.researchergroup = req.body.researcher.researchergroup;
        doc.researcher.researchername = req.body.researcher.researchername;
        doc.organisation = req.body.organisation;
        doc.specialisation = req.body.specialisation;
        doc.starttime = req.body.starttime;
        doc.endtime = req.body.endtime;
        doc.timeperiodfrequency = req.body.timeperiodfrequency;
        doc.notificationfrequency = req.body.notificationfrequency;
        doc.imageresource = req.body.imageresource;
        doc.minage = req.body.minage;
        doc.condition = req.body.condition;
        doc.prereqtype = req.body.prereqtype;
        doc.save();
    });
    res.redirect('/');
});

router.post('/delete', function (req, res, next) {
    var id = req.body.id;
    UserData.findByIdAndRemove(id).exec();
    console.log("Removed---> ", id);
    res.redirect('/');
});

router.post('/deleteq', function (req, res, next) {
    var idq = req.body.idq;
    QuestionData.findByIdAndRemove(idq).exec();
    console.log("Removed---> ", idq);
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}

function generateRow(id, content) {
    return '<div class="row flex-row" id="' + id + '">' +
        content +
        '</div>';
}

var MAX_LENGTH = 300;

function trimString(input, length) {
    if (input != null) {
        var trimmedString = input.substr(0, length);
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
        if (trimmedString.charAt(trimmedString.length - 1) == ".") {
            return trimmedString + "..";
        } else {
            return trimmedString + "...";
        }
    }
    return "";
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

function generateDashboard(res) {
    trialData.getTrialsByUsername(function (err, data) {
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
            element += generateTile(data[i]['trialname'], data[i]['description'], data[i]['imageresource'], data[i]['_id']);

            if (i == data.length - 1)
                container += generateRow(rowId, element);
        }
        res.render('dashboard', {
            active_main: "true",
            content: container
        });
    });
}
module.exports = router;