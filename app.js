var Globals = require('./routes/Globals');

var express = require('express');
var path = require('path');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
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
    name: 'TEST COOKIE',
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
    if (typeof req.session.views === 'undefined') {
        req.session.views = 0;
    }
    res.render('index');
});

app.use(function printSession(req, res, next) {
    console.log('req.session', req.session , req.session.views);
    console.log('++++++++++++++++++');
    console.assert(typeof req.session.views === 'number',
        'missing views count in the session', req.session);
    req.session.views++;
    return next();
});

// GET TRial Data
app.get('/api/trialdata', function (req, res) {
    trialData.getTrialData(function (err, trialdata) {
        if (err) {
            throw err;
        }
        res.json(trialdata);
    });
});
var candidateAccountSchema = require('./models/Accounts/candidateAccountSchema');
var conditionsSchema = require('./models/Accounts/conditionsSchema');
var epochSchema = require('./models/Trials/epochSchema');
var exclusionSchema = require('./models/Trials/exclusionSchema');
var inclusionSchema = require('./models/Trials/inclusionSchema');
var requestedCandidatesSchema = require('./models/Validation/requestedCandidateSchema');
var researcherAccountsSchema = require('./models/Accounts/researcherAccountSchema');
var researcherSchema = require('./models/Trials/researcherSchema');
var responseSchema = require('./models/Trials/responseSchema');
var trialSchema = require('./models/Trials/trialSchema');
var verifiedCandidatesSchema = require('./models/Validation/verifiedCandidateSchema');

//schemas
var candidateAccount = mongoose.model('CandidateAccounts', candidateAccountSchema);
var researcherAccount = mongoose.model('ResearcherAccounts', researcherAccountsSchema);
var conditionsData = mongoose.model('Conditions', conditionsSchema);

var epochData = mongoose.model('Epochs', epochSchema);
var exclusionsData = mongoose.model('Exclusions', exclusionSchema);
var inclusionsData = mongoose.model('Inclusions', inclusionSchema);
var requestedCandidatesData = mongoose.model('RequestedCandidates', requestedCandidatesSchema);
var researcherAccountsData = mongoose.model('ResearcherAccounts', researcherAccountsSchema);
var researcherData = mongoose.model('Researchers', researcherSchema);
var responseData = mongoose.model('Responses', responseSchema);
var trialData = mongoose.model('Trials', trialSchema);
var verifiedCandidatesData = mongoose.model('VerifiedCandidates', verifiedCandidatesSchema);

// candidates
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

// researchers
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

// conditions
app.post('/debug/create-condition/:candidateid/:count', function (req) {
    var conditions = {};
    for (var i = 0; i < req.params.count; i++) {
        var item = i;
        conditions["condition" + item] = item;
    }

    var mockData = {
        userid: req.params.candidateid
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

// inclusions
app.get('/debug/create-inclusion/:trialid/:count', function (req, res) {
    var inclusions = {};
    for (var i = 0; i < req.params.count; i++) {
        inclusions["inclusion" + i] = Math.floor(Math.random() * 100).toString();
    }

    var inclusionData = {
        trialid: req.params.trialid
    };

    inclusionsData.createInclusions(new inclusionsData(inclusionData));
    res.redirect('/debug/get-inclusions');
});
app.post('/api/create-inclusion', function (req, res) {
    inclusionsData.createInclusions(new inclusionsData(req.body));
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
app.get('/api/get-inclusions', function (req, res) {
    inclusionsData.getInclusions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-inclusion/:userid', function (req, res) {
    conditionsData.getConditionById(req.params.userid, function (err, result) {
        if (err) throw err;
        res.json(result.conditions);
    });
});

//trials
app.post('/api/create-trial/:researcherid', function (req, res) {
    var trialParams = req.body;
    var trialDataParams = {
        researcherid: req.params.researcherid
    };

    trialData.createTrial(new trialData(trialDataParams));
    res.redirect('/debug/get-trials');
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

// -------------------------------------------------------

app.get('/api/randomrecords', function (req, res, next) {
    trialData.getRandomTrial(3, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});


app.post('/api/responsedata', function (req, res, next) {
    var data = "";

    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        res.writeHead(200, "OK", {'Content-Type': 'text/html'});
        res.end();

        var valueField = JSON.parse(data);

        var typeField = clone(valueField);
        traverseNodes(typeField);
        var responseSchema = new mongoose.Schema(generator.convert(typeField));
        var responseModel = mongoose.model(res + Date.now(), responseSchema, 'res');

        var reversedValueField = clone(valueField);
        traverseDataNodes(reversedValueField);

        addResponseData(responseModel, reversedValueField, function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
});

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
function traverseNodes(o, func) {
    for (var i in o) {
        if (o[i] !== null && typeof(o[i]) == "object") {
            traverseNodes(o[i], func);
        } else {
            o[i] = {
                type: "String"
            }
        }
    }
}
function traverseDataNodes(p, func) {
    for (var i in p) {
        if (p[i] !== null && typeof(p[i]) == "object") {
            traverseDataNodes(p[i], func);
        }
    }
}

addResponseData = function (model, value, callback) {
    model.create(value, callback);
};

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

//get number of trials in collection
app.get('/trial_number', function (req, res, next) {
    trialData.getTrialData(function (err, trialdata) {
        if (err) {
            throw err;
        }
        res.json(trialdata.length + " records in collection");
    });
});

//POST question data
app.post('/api/questiondata', function (req, res) {
    var quest = req.body;
    questionData.addQuestionData(function (err, quest) {
        if (err) {
            throw err;
        }
        res.json(response);
    })
});
// GET question data
app.get('/api/questiondata', function (req, res) {
    questionData.getQuestionData(function (err, questiondata) {
        if (err) {
            throw err;
        }
        res.json(questiondata);
    });
});
//GET user data
app.get('/api/user', function (req, res) {
    userdata.getUser(function (err, userdata) {
        if (err) {
            throw err;
        }
        res.json(userdata);
    });
});

app.use('/', routes); //mapped to routes which goes to index file
app.use('/users', users);//goes to users.js

// Set Port
app.set('port', (process.env.PORT || Globals.PORT));
app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});