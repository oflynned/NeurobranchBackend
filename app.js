//constants for ports, addresses and other non-variable items
var Globals = require('./routes/Globals');

var express = require('express');
var path = require('path');
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
// Models files
var trialData = require('./models/trialdata');
var questionData = require('./models/questiondata');
var responseData = require('./models/responsedata');
var userdata = require('./models/user');

var util = require('util');
var generator = require('mongoose-gen');

// Init App -- type $ node app.js
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
// handlebars supports html
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware // for cookies
//app.use(express.static(_dirname+'/researcherside'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


// Set Static Folder
// where stuff that is publicly accesible to the browsert is put--in this instance the public available stuff is in folder public 
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: Globals.SECRET,
    saveUninitialized: true,
    resave: true
}));

// Passport init-- to be able to use passport author
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
//GET main page
app.get('/', function (req, res, next) {
    res.render('index');
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

//GET Response Data
app.get('/api/responsedata', function (req, res) {
    responseData.getresponseData(function (err, responsedata) {
        if (err) {
            throw err;
        }
        res.json(responsedata);
    })
});

app.get('/api/responsedata/id/:_id', function (req, res) {
    responseData.getresponseDataById(req.params._id, function (err, responsebyid) {
        if (err) {
            throw err;
        }
        res.json(responsebyid);
    })
});

//GET Response data by trialid
app.get('/api/responsedata/trial/:trialid', function (req, res) {
    responseData.getresponseDataByTrialId(req.params.trialid, function (err, responsebytrialid) {
        if (err) {
            throw err;
        }
        res.json(responsebytrialid);
    })
});

//GET Response data by epochid
app.get('/api/responsedata/epoch/:epochid', function (req, res) {
    responseData.getresponseDataByEpochId(req.params.epochid, function (err, responsebyepochid) {
        if (err) {
            throw err;
        }
        res.json(responsebyepochid);
    })
});


app.get('/api/randomrecords', function(req, res, next) {
    trialData.getRandomTrial(3, function(err, result) {
        if(err) throw err;
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
function traverseNodes(o,func) {
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

function traverseDataNodes(p,func) {
    for (var i in p) {
        if (p[i] !== null && typeof(p[i])=="object") {
            traverseDataNodes(p[i],func);
        }
    }
}

addResponseData = function(model, value, callback){
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