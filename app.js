"use strict";

let Globals = require('./routes/Globals');
let express = require('express');

let path = require('path');
let fs = require('fs');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let exphbs = require('express-handlebars');
let flash = require('connect-flash');
let session = require('express-session');
let passport = require('passport');
let bodyParser = require('body-parser');

let mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/neurobranch_db');

let routes = require(Globals.INDEX_ROUTE);
let users = require(Globals.USERS_ROUTE);

let util = require('util');
let async = require('async');
let app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));

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

app.use(bodyParser.urlencoded({"extended": false}));
app.get('/', function (req, res) {
    res.render('mainpage');
});

let candidateDelegationEndpoints = require("./routes/api/candidateDelegation");
app.use(candidateDelegationEndpoints);

let candidateEndpoints = require("./routes/api/candidates");
app.use(candidateEndpoints);

let debugEndpoints = require("./routes/api/debug");
app.use(debugEndpoints);

let eligibilityEndpoints = require("./routes/api/eligibility");
app.use(eligibilityEndpoints);

let emailEndpoints = require("./routes/api/email");
app.use(emailEndpoints);

let questionEndpoints = require("./routes/api/questions");
app.use(questionEndpoints);

let requestedCandidateEndpoints = require("./routes/api/requestedCandidates");
app.use(requestedCandidateEndpoints);

let researcherEndpoints = require("./routes/api/researchers");
app.use(researcherEndpoints);

let responseEndpoints = require("./routes/api/response");
app.use(responseEndpoints);

let trialEndpoints = require("./routes/api/trial");
app.use(trialEndpoints);

let verifiedCandidateEndpoints = require("./routes/api/verifiedCandidates");
app.use(verifiedCandidateEndpoints);

let csvDownloadEndpoints = require("./routes/api/csvDownload");
app.use(csvDownloadEndpoints);

app.use('/', routes);
app.use('/users', users);
app.set('port', (process.env.PORT || Globals.PORT));

let Scheduler = require("./routes/logic/scheduler");
Scheduler.scheduleUpdate();

app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});


