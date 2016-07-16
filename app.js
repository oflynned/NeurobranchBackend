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

//mongoose.connect('mongodb://localhost/neurobranch_db');
var routes = require(Globals.INDEX_ROUTE);
var users = require(Globals.USERS_ROUTE);
// Models files
var trialData = require('./models/trialdata');
var questionData = require('./models/questiondata');
var responseData = require('./models/responsedata');
var userdata = require('./models/user');

// Init App -- type $ node app.js
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
// handlebars supports html
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware // for cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


mongoose.connect('mongodb://localhost/neurobranch_db');

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

app.get('/', function (req, res, next) {
    res.render('mainpage');
});

app.get('/api/trialdata', function (req, res) {
    trialData.getTrialData(function (err, trialdata) {
        if (err) {
            throw err;
        }
        res.json(trialdata);
    });
});

app.get('/api/questiondata', function (req, res) {
    questionData.getQuestionData(function (err, questiondata) {
        if (err) {
            throw err;
        }
        res.json(questiondata);
    });
});

app.post('/api/questiondata', function (req, res) {
    var quest = req.body;
    questionData.addQuestionData(quest ,function (err, quest) {
        if (err) {
            throw err;
        }
        res.json(quest);
    });
});

app.post('/api/responsedata', function (req, res) {
    var resp = req.body;
    responseData.addResponseData(resp ,function (err, resp) {
        if (err) {
            throw err;
        }
        res.json(resp);
    });
});

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

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Port
app.set('port', (process.env.PORT || Globals.PORT));
app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});