var Globals = require('./routes/Globals');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/neurobranch_db');
var routes = require(Globals.INDEX_ROUTE);
var users = require(Globals.USERS_ROUTE);

var util = require('util');
var generator = require('mongoose-gen');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: Globals.SECRET,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
app.get('/', function (req, res, next) {
    res.render('mainpage');
});

var candidateAccountSchema = require('./models/Accounts/candidateAccountSchema');
var conditionsSchema = require('./models/Accounts/conditionsSchema');
var exclusionSchema = require('./models/Trials/exclusionSchema');
var inclusionSchema = require('./models/Trials/inclusionSchema');
var requestedCandidatesSchema = require('./models/Validation/requestedCandidateSchema');
var questionSchema = require('./models/Trials/questionSchema');
var researcherAccountsSchema = require('./models/Accounts/researcherAccountSchema');
var researcherSchema = require('./models/Trials/researcherSchema');
var responseSchema = require('./models/Trials/responseSchema');
var trialSchema = require('./models/Trials/trialSchema');
var verifiedCandidatesSchema = require('./models/Validation/verifiedCandidateSchema');

//schemas
var candidateAccount = mongoose.model('CandidateAccounts', candidateAccountSchema);
var researcherAccount = mongoose.model('ResearcherAccounts', researcherAccountsSchema);
var conditionsData = mongoose.model('Conditions', conditionsSchema);

//base interactions
var trialData = mongoose.model('Trials', trialSchema);
var questionData = mongoose.model('Questions', questionSchema);

//meta data about trials
var exclusionsData = mongoose.model('Exclusions', exclusionSchema);
var inclusionsData = mongoose.model('Inclusions', inclusionSchema);
var researcherData = mongoose.model('Researchers', researcherSchema);
var responseData = mongoose.model('Responses', responseSchema);

//verification to trial
var verifiedCandidatesData = mongoose.model('VerifiedCandidates', verifiedCandidatesSchema);
var requestedCandidatesData = mongoose.model('RequestedCandidates', requestedCandidatesSchema);

//candidates
app.post('/api/create-candidate', function (req) {
    candidateAccount.createCandidate(new candidateAccount(req.body));
});
app.get('/api/get-candidates', function (req, res) {
    candidateAccount.getCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-candidates/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-candidates/:email', function (req, res) {
    candidateAccount.getCandidateByEmail(req.params.email, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

//researchers
app.post('/api/create-researcher', function (req, res) {
    researcherAccount.createResearcher(new researcherAccount(req.body));
    res.redirect("/users/login");
});
app.get('/api/get-researchers', function (req, res) {
    researcherAccount.getResearcher(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-researchers/id/:id', function (req, res) {
    researcherAccount.getResearcherById(req.params.id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-researchers/email/:email', function (req, res) {
    researcherAccount.getResearcherByEmail(req.params.email, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-researchers/username/:username', function (req, res) {
    researcherAccount.getResearcherByUsername(req.params.username, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

//conditions
app.post('/debug/create-condition/:candidateid/:count', function (req) {
    var conditions = {};
    for (var i = 0; i < req.params.count; i++) {
        var item = i;
        conditions["condition" + item] = item;
    }

    var mockData = {
        userid: req.params.candidateid,
        conditions
    };
    conditionsData.createCondition(new conditionsData(mockData));
});
app.get('/debug/edit-condition/:id/:count', function (req, res) {
    var conditions = {};
    for (var i = 0; i < req.params.count; i++) {
        conditions["condition" + i] = Math.floor(Math.random() * 100).toString();
    }

    conditionsData.getConditionById(req.params.id, function (err, doc) {
        doc.conditions = conditions;
        doc.save();
    });
    res.redirect('/debug/get-conditions');
});
app.get('/api/get-conditions', function (req, res) {
    conditionsData.getConditions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-conditions/:userid', function (req, res) {
    conditionsData.getConditionById(req.params.userid, function (err, result) {
        if (err) throw err;
        res.json(result.conditions);
    })
});

//trials
app.post('/api/create-trial', function (req, res) {
    var trialParams = req.body;
    var trialDataParams = {};

    for(var attribute in trialParams) {
        trialDataParams[attribute] = trialParams[attribute];
    }

    trialDataParams['researcherid'] = req.user.id;
    trialDataParams['institute'] = req.user.institute;

    console.log(trialDataParams);

    trialData.createTrial(new trialData(trialDataParams));
    res.redirect('/users/dashboard');
});
app.get('/api/get-trials', function (req, res) {
    trialData.getTrials(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-trials/:researcherid', function (req, res) {
    trialData.getTrialsByResearcherId(req.params.researcherid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.delete('/api/delete-trial/:trialid', function (req, res) {
    //TODO
});

//debug trials
app.get('/debug/create-trial/:researcherid', function (req, res) {
    var trialParams = {
        title: "title" + Date.now(),
        briefdescription: "briefdescription" + Date.now(),
        detaileddescription: "detaileddescription" + Date.now(),
        trialtype: "trialtype" + Date.now(),
        organisation: "organisation" + Date.now(),
        condition: "condition" + Date.now(),
        datecreated: "datecreated" + Date.now(),
        datepublished: "datepublished" + Date.now(),
        dateactive: "dateactive" + Date.now(),
        candidatequota: "candidatequota" + Date.now(),
        state: "state" + Date.now(),
        researcherid: req.params.researcherid
    };
    trialData.createTrial(new trialData(trialParams));
    res.redirect('/debug/get-trials');
});
app.get('/debug/edit-trial/:userid', function (req, res) {
    var inclusions = {};
    for (var i = 0; i < req.params.count; i++) {
        inclusions[i] = Math.floor(Math.random() * 100).toString();
    }

    inclusionsData.getInclusionsById(req.param.userid, function (err, doc) {
        if (err) throw err;
        doc.inclusions = inclusions;
        doc.save();
    });
    res.redirect('/debug/get-trials');
});

//questions
app.post('/api/create-question/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var questionParams = req.body;
    var questionDataParams = {
        trialid: trialid,
        questionParams
    };

    questionData.createQuestion(new questionData(questionDataParams));
    res.redirect('/api/get-questions');
});
app.get('/api/get-questions', function (req, res) {
    questionData.getQuestions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/:questionid', function (req, res) {
    questionData.getQuestionById(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/:trialid', function (req, res) {
    questionData.getQuestionByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/:trialid/:questionid', function (req, res) {
    questionData.getQuestionByAllParams(req.params.questionid, req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.delete('/api/delete-question/:questionid', function (req, res) {

});
app.delete('/api/delete-epoch-questions/:trialid', function (req, res) {

});

//inclusions
app.post('/api/create-inclusion/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var inclusions = req.body;
    var inclusionDataParams = {
        trialid: trialid,
        inclusions
    };
    inclusionsData.createInclusions(new inclusionsData(inclusionDataParams));
    res.redirect('/api/get-inclusions');
});
app.get('/api/get-inclusions', function (req, res) {
    inclusionsData.getInclusions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-inclusions/:trialid', function (req, res) {
    inclusionsData.getInclusionsById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.inclusions);
    });
});
app.delete('/api/delete-inclusion/:inclusionid', function (req, res) {
    
});

//exclusions
app.post('/api/create-exclusion/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var exclusions = req.body;
    var exclusionDataParams = {
        trialid: trialid,
        exclusions
    };
    exclusionsData.createInclusions(new exclusionsData(exclusionDataParams));
    res.redirect('/api/get-exclusions');
});
app.get('/api/get-exclusions', function (req, res) {
    exclusionsData.getInclusions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-exclusions/:trialid', function (req, res) {
    exclusionsData.getInclusionsById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.exclusions);
    });
});
app.delete('/api/delete-exclusion/:exclusionid', function (req, res) {

});

//responses
app.post('/api/create-response/:questionid', function (req, res) {
    var questionid = req.params.questionid;
    var responseParams = req.body;
    var responseDataParams = {
        questionid: questionid,
        responseParams
    };

    responseData.createResponse(new responseData(responseDataParams));
    res.redirect('/api/get-responses');
});
app.get('/api/get-responses', function (req, res) {
    responseData.getResponses(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/:_id', function (req, res) {
    responseData.getResponseById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/:questionid', function (req, res) {
    responseData.getResponseByQuestionId(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/:questionid/:candidateid', function (req, res) {
    responseData.getResponseByQuestionIdCandidateId(req.params.questionid, req.params.candidateid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.delete('/api/delete-response/:_id', function(req, res) {

});

//researchers ownership of trial meta data, ie who is hosting the trial
app.post('/api/create-researcher-data/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var researchers = req.body;
    var researcherDataParams = {
        trialid: trialid,
        researchers
    };
    researcherData.createResearchers(new researcherData(researcherDataParams));
    res.redirect('/api/get-researcher-data');
});
app.get('/api/get-researcher-data', function (req, res) {
    researcherData.getResearchers(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-researcher-data/:trialid', function (req, res) {
    researcherData.getResearchersById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.exclusions);
    });
});
app.get('/api/get-researcher-data/:_id', function (req, res) {
    researcherData.getResearchersById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.exclusions);
    });
});
app.delete('/api/delete-researcher-data/:_id', function (req, res) {

});

//debug inclusions
app.get('/debug/create-inclusion/:trialid/:count', function (req, res) {
    var inclusions = {};
    for (var i = 0; i < req.params.count; i++) {
        inclusions["inclusion" + i] = Math.floor(Math.random() * 100).toString();
    }

    var inclusionData = {
        trialid: req.params.trialid,
        inclusions
    };

    inclusionsData.createInclusions(new inclusionsData(inclusionData));
    res.redirect('/debug/get-inclusions');
});
app.get('/debug/edit-inclusions/:userid/:count', function (req, res) {
    var inclusions = {};
    for (var i = 0; i < req.params.count; i++) {
        inclusions[i] = Math.floor(Math.random() * 100).toString();
    }

    inclusionsData.getInclusionsById(req.param.userid, function (err, doc) {
        if (err) throw err;
        doc.inclusions = inclusions;
        doc.save();
    });
    res.redirect('/debug/get-inclusions');
});

//verified candidate lists
app.post('/api/create-verified-candidates/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var users = req.body;
    var verifiedCandidatesDataParams = {
        trialid: trialid,
        users
    };
    verifiedCandidatesData.create(new verifiedCandidatesData(verifiedCandidatesDataParams));
    res.redirect('/api/get-exclusions');
});
app.get('/api/get-verified-candidates', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-verified-candidates/:trialid', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.get('/api/get-verified-candidates/:_id', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.delete('/api/delete-verified-candidates/:_id', function (req, res) {

});

//requested candidate lists
app.post('/api/create-requested-candidates/:trialid', function (req, res) {
    var trialid = req.params.trialid;
    var users = req.body;
    var requestedCandidatesDataParams = {
        trialid: trialid,
        users
    };
    requestedCandidatesData.create(new requestedCandidatesData(requestedCandidatesDataParams));
    res.redirect('/api/get-exclusions');
});
app.get('/api/get-requested-candidates', function (req, res) {
    requestedCandidatesData.getRequestedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/:trialid', function (req, res) {
    requestedCandidatesData.getRequestedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.get('/api/get-requested-candidates/:_id', function (req, res) {
    requestedCandidatesData.getRequestedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.delete('/api/delete-requested-candidates/:_id', function (req, res) {

});

//debug
//get number of trials in collection
app.get('/debug/trial-number', function (req, res) {
    trialData.getTrialData(function (err, trialdata) {
        if (err) throw err;
        res.json(trialdata.length + " records in collection");
    });
});

//mapping
app.use('/', routes);
app.use('/users', users);

app.set('port', (process.env.PORT || Globals.PORT));
app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});