var Globals = require('./routes/Globals');

var express = require('express');


var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var crypto = require('crypto');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
var redis = require('redis');
var redisClient = redis.createClient(); // default setting.

mongoose.connect('mongodb://localhost/neurobranch_db');
var routes = require(Globals.INDEX_ROUTE);
var users = require(Globals.USERS_ROUTE);

var util = require('util');
var bcrypt = require('bcrypt');
var async = require('async');
var app = express();
/*SMTP*/
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "teztneuro@gmail.com",
        pass: "lCk3TN:68w4Yn8C"
    }
});
/*ENd of SMTP*/

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

var host = "localhost:3000";
app.use(bodyParser.urlencoded({"extended" : false}));

app.get('/', function (req, res) {
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
app.post('/api/create-candidate', function (req, res) {
    req.body["isverified"] = "false";
    candidateAccount.createCandidate(new candidateAccount(req.body));
    res.redirect('/');
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
app.post('/api/candidate-login', function (req, res) {
    candidateAccount.getCandidateByEmail(req.body.email, function (error, result) {
        console.log(req.body);
        if (error) throw error;
        if (result != null) {
            candidateAccount.comparePasswords(req.body.password, result.password, function (err, isMatch) {
                if (err) throw err;
                res.json({
                    isMatch: isMatch,
                    id: result.id
                });
            });
        }
    });
});
app.get('/api/verify-candidate/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, doc) {
        doc.isverified = "true";
        doc.save();
    });
    res.redirect('/users/verified');
});

//email verification
app.post('/send',function(req,res) {
    console.log('email--->' + req.body.to);
    console.log('forename--->' + req.body.forename);
    req.body["isverified"] = "false";
    researcherAccount.createResearcher(new researcherAccount(req.body));

    async.waterfall([
        function(callback) {
            redisClient.exists(req.body.to,function(err,reply) {
                if(err) {
                    return callback(true,"Error in redis");
                }
                if(reply === 1) {
                    return callback(true,"Email already requested");
                }
                callback(null);
            });
        },
        function(callback) {
            "use strict";
            let rand=Math.floor((Math.random() * 100) + 54);
            let encodedMail = new Buffer(req.body.to).toString('base64');
            let link="http://"+req.get('host')+"/verify?mail="+encodedMail+"&id="+rand;
            let mailOptions={
                from : 'teztneuro@gmail.com',
                to : req.body.to,
                subject : "Please confirm your Email account",
                html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            };
            callback(null,mailOptions,rand);
        },
        function(mailData,secretKey,callback) {
            req.body["isverified"] = "false";
            researcherAccount.createResearcher(new researcherAccount(req.body));


            console.log(mailData);
            smtpTransport.sendMail(mailData, function(error, response){
                if(error){
                    console.log(error);
                    return callback(true,"Error in sending email");
                }
                console.log("Message sent: " + JSON.stringify(response));
                redisClient.set(req.body.to,secretKey);
                redisClient.expire(req.body.to,600); // expiry for 10 minutes.
                callback(null,"Email sent Successfully");
            });
        }
    ],function(err,data) {
        console.log(err,data);
        res.json({error : err === null ? false : true, data : data});
    });
});
app.get('/verify',function(req,res) {
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host')) === ("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        async.waterfall([
            function(callback) {
                "use strict";
                let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
                redisClient.get(decodedMail,function(err,reply) {
                    if(err) {
                        return callback(true,"Error in redis");
                    }
                    if(reply === null) {
                        return callback(true,"Invalid email address");
                    }

                    callback(null,decodedMail,reply);
                });
            },
            function(key,redisData,callback) {
                if(redisData === req.query.id) {
                    redisClient.del(key,function(err,reply) {
                        if(err) {
                            return callback(true,"Error in redis");
                        }
                        if(reply !== 1) {
                            return callback(true,"Issue in redis");
                        }
                       /* callback(null,"Email is verified");*/

                        /*researcherAccount.getResearcherById(req.params.id, function (err, doc) {
                            doc.isverified = "true";
                            doc.save();
                        });*/
                        res.redirect('/users/verified');
                    });
                } else {
                    return callback(true,"Invalid token");
                }
            }
        ],function(err,data) {
            res.send(data);
        });
    } else {
        res.end("<h1>Request is from unknown source");
    }
});
app.post('/emailverify',function (req, res, next) {
    

});
app.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            researcherAccount.findOne({email: req.body.email}, function (err, user) {
                if (!user) {
                    console.log('No account with that email address exists.');
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            console.log("Reset Email was sent");
            var mailOptions = {
                to: user.email,
                from: 'teztneuro@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/');
    });
});
app.get('/reset/:token', function (req, res) {
    researcherAccount.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/help');
        }
        res.render('reset', {
            user: req.user
        });
    });
});
app.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            researcherAccount.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                bcrypt.genSalt(10 , function (err ,salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password =hash;
                        console.log(user.password);

                        user.save(function (err) {
                            if(err) throw err;
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });

                    });
                });
            });
        },
        function (user, done) {
            var mailOptions = {
                to: user.email,
                from: 'teztneuro@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello '+user.forename+ ','+'\n\n' +
                'This is a confirmation that the password for your account ' + user.email +' has just been changed to' + user.password + '\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});

//researchers
app.post('/api/create-researcher', function (req, res) {
    req.body["isverified"] = "false";
    researcherAccount.createResearcher(new researcherAccount(req.body));
    res.redirect("/users/login");
});
app.get('/api/verify-researcher/:id', function (req, res) {
    researcherAccount.getResearcherById(req.params.id, function (err, doc) {
        doc.isverified = "true";
        doc.save();
    });
    res.redirect('/users/verified');
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
    //sort into trial and qs
    //log trial
    //retrieve trial by search with latest id
    //log q documents with this id as trialid
    //to be implemented lol

    //console.log(req.body);

    var trialParams = {
        title: req.body.title,
        briefdescription: req.body.briefdescription,
        detaileddescription: req.body.detaileddescription,
        trialtype: req.body.trialtype,
        institute: req.user.institute,
        condition: req.body.condition,
        duration: req.body.duration,
        frequency: req.body.frequency,
        screening: req.body.screening,
        form1: req.body.form1,
        datecreated: Date.now(),
        datestarted: undefined,
        dateended: undefined,
        candidatequota: req.body.candidatequota,
        state: "created",
        researcherid: req.user.id
    };

    trialData.createTrial(new trialData(trialParams), function() {
        trialData.getLatestTrialByResearcher(req.user.id, function (err, result) {
            var trialId = result[0]["_id"];

            for (var removeAttribute in trialParams) {
                delete req.body[removeAttribute];
            }

            var i=1;
            var questionParams= {};
            for(var att in req.body) {
                if(att == 'questiontitle'+i) {
                    questionParams['title'] = req.body[att];
                }
                if(att == 'questiontype'+i) {
                    questionParams['questiontype'] = req.body[att];
                }
                if(att == 'answers'+i) {
                    var tempSplit = req.body[att];
                    tempSplit = tempSplit.replace("\r", "").split("\n");
                    var questionAnswers = {};
                    for(var j=0; j<tempSplit.length; j++) {
                        questionAnswers['answer' + j] = tempSplit[j];
                    }

                    questionParams['trialid'] = trialId;
                    questionParams['answers'] = questionAnswers;
                    questionData.createQuestion(new questionData(questionParams));
                    console.log(questionParams);
                    i++;
                    questionParams = {};
                }
            }
        });
    });

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

app.post('/verify_can/:id',function(req, res){


    res.redirect('/users/trials/'+id);
});

app.post('/reject_can/:id',function(req, res, next){
    var id = req.body.userid;

    requestedCandidatesData.removeRequestedCandidate(req.params.userid , function (err, rej) {
        if (err) throw err;

    });
    /*res.redirect('/users/trials/'+id);*/

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
app.get('/api/get-questions/questionid/:questionid', function (req, res) {
    questionData.getQuestionById(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/trialid/:trialid', function (req, res) {
    questionData.getQuestionsByTrialId(req.params.trialid, function (err, result) {
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
app.post('/api/create-response/', function (req, res) {
    console.log(req.body);

    var responseDataParams = {
        trialid: req.body.trialid,
        questionid: req.body.questionid,
        candidateid: req.body.candidateid,
        response: req.body.response
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
app.get('/api/get-responses/id/:_id', function (req, res) {
    responseData.getResponseById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/questionid/:questionid', function (req, res) {
    responseData.getResponseByQuestionId(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/trialid/:trialid', function (req, res) {
    responseData.getResponseByTrialId(req.params.trialid, function (err, result) {
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
app.delete('/api/delete-response/:_id', function (req, res) {

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
app.post('/api/create-verified-candidate/trialid/:trialid/candidateid/:userid', function (req, res) {
    requestedCandidatesData.removeRequestedCandidate(req.params.trialid, req.params.userid, function(err) {
        if(err) throw err;
        var candidateData = {
            trialid: req.params.trialid,
            userid: req.params.userid
        };

        res.redirect('/users/trials/' + req.params.trialid);
        verifiedCandidatesData.create(new verifiedCandidatesData(candidateData, function(err) {
            if(err) throw err;
            res.redirect('/users/trials/' + req.params.trialid);
        }));
    });
});
app.get('/api/get-verified-candidates', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-verified-candidates/trialid/:trialid', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.get('/api/get-verified-candidates/listid/:_id', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.delete('/api/delete-verified-candidates/:_id', function (req, res) {

});

//requested candidate lists
app.post('/api/create-requested-candidate', function (req, res) {
    requestedCandidatesData.create(new requestedCandidatesData(req.body));
    res.redirect('/');
});
app.get('/api/get-requested-candidates', function (req, res) {
    requestedCandidatesData.getRequestedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/trialid/:trialid', function (req, res) {
    requestedCandidatesData.getRequestedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/candidate/:candidateid', function (req, res) {
    requestedCandidatesData.getRequestedCandidatesByUserId(req.params.candidateid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/listid/:_id', function (req, res) {
    requestedCandidatesData.getRequestedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.post('/api/remove-requested-candidate/trialid/:trialid/candidateid/:userid', function (req, res) {
     requestedCandidatesData.removeRequestedCandidate(req.params.trialid, req.params.userid, function (err) {
         if(err) throw err;
         res.redirect('/users/trials/' + req.params.trialid);
     })
});
app.get('/api/delete-requested-candidates/:_id', function (req, res) {

});

//debug
//get number of trials in collection
app.get('/debug/trial-number', function (req, res) {
    trialData.getTrials(function (err, trialdata) {
        if (err) throw err;
        res.json(trialdata.length + " records in collection");
    });
});
app.post('/debug/see-response', function (req) {
    console.log(req.body);
});

//mapping
app.use('/', routes);
app.use('/users', users);

app.set('port', (process.env.PORT || Globals.PORT));
app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});