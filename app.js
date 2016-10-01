var Globals = require('./routes/Globals');

var express = require('express');


var path = require('path');
var fs = require('fs');
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
var redisClient = redis.createClient();
var schedule = require('node-schedule');

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
app.use(bodyParser.urlencoded({"extended": false}));

app.get('/', function (req, res) {
    res.render('mainpage');
});

var candidateAccountSchema = require('./models/Accounts/candidateAccountSchema');
var conditionsSchema = require('./models/Accounts/conditionsSchema');
var requestedCandidatesSchema = require('./models/Validation/requestedCandidateSchema');
var questionSchema = require('./models/Trials/questionSchema');
var eligibilitySchema = require('./models/Trials/eligibilitySchema');
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
var eligibilityData = mongoose.model('Eligibility', eligibilitySchema);

//meta data about trials
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
app.get('/api/get-candidate-subscriptions/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        res.json(result.subscribed);
    })
});
app.get('/api/can-candidate-respond/trialid/:trialid/userid/:userid', function (req, res) {
    //get latest window for trial
    //get last window id from past candidate responses already
    //check if null if no responses so far

});

app.get('/api/get-candidate-trials/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        var trials = result.subscribed.reduce(function (keys, element) {
            for (var key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        trialData.getTrialsByList(trials, function (err, result) {
            res.json(result);
        })
    });
});
app.get('/api/get-candidate-trials/:id/:state', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        var trials = result.subscribed.reduce(function (keys, element) {
            for (var key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        trialData.getTrialsByListState(trials, req.params.state, function (err, result) {
            res.json(result);
        })
    });
});
app.get('/api/get-candidate-my-trials/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        var trials = result.subscribed.reduce(function (keys, element) {
            for (var key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        trialData.getTrialsByListExcludingState(trials, "ended", function (err, result) {
            res.json(result);
        })
    });
});
app.get('/api/get-candidate-excluded-trials/:id', function (req, res) {
    candidateAccount.getCandidateById(req.params.id, function (err, result) {
        var trials = result.subscribed.reduce(function (keys, element) {
            for (var key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);
        if (trials.length == 0) {
            trialData.getTrials(function (err, trials) {
                res.json(trials);
            });
        } else {
            trialData.getTrialsByExcluded(trials, function (err, trials) {
                if (err) throw err;
                res.json(trials);
            });
        }
    });
});

//email verification
app.post('/send', function (req, res) {
    console.log('email--->' + req.body.to);
    req.body["email"] = req.body.to;
    req.body["isverified"] = "false";
    researcherAccount.createResearcher(new researcherAccount(req.body), function (err, reresult) {
        /*async.waterfall([
         /*function (callback) {
         >>>>>>> 4b54d8042471d76f2aac6ec6d9bc3a0a7191fa3c
         redisClient.exists(req.body.to, function (err, reply) {
         if (err) {
         return callback(true, "Error in redis");
         }
         if (reply === 1) {
         return callback(true, "Email already requested");
         }
         callback(null);
         });
         },*/
        /*function (callback) {
         "use strict";
         let rand = reresult.id;
         let encodedMail = new Buffer(req.body.to).toString('base64');
         let link = "http://" + req.get('host') + "/verify?mail=" + encodedMail + "&id=" + rand;
         let mailOptions = {
         from: 'teztneuro@gmail.com',
         to: req.body.to,
         subject: "Please confirm your Email account",
         html: "Hello " + req.body.forename + ",<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
         };
         callback(null, mailOptions, rand);
         },*/
        /* function (mailData, secretKey, callback) {
         smtpTransport.sendMail(mailData, function (error, response) {
         if (error) {
         console.log(error);
         return callback(true, "Error in sending email");
         }
         console.log("Message sent: " + JSON.stringify(response));
         redisClient.set(req.body.to, secretKey);
         redisClient.expire(req.body.to, 600); // expiry for 10 minutes.
         callback(null, "Email sent Successfully");
         });
         }*/
        /*], function (err, data) {
         console.log(err, data);
         res.json({error: err !== null, data: data});
         });*/

    });
});
app.get('/verify', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));

    if ((req.protocol + "://" + req.get('host')) === ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        researcherAccount.getResearcherById(req.query.id, function (err, reverificate) {
            reverificate.isverified = "true";
            reverificate.save();
            async.waterfall([
                function (callback) {
                    "use strict";
                    let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
                    redisClient.get(decodedMail, function (err, reply) {
                        if (err) {
                            return callback(true, "Error in redis");
                        }
                        if (reply === null) {
                            return callback(true, "Invalid email address");
                        }
                        callback(null, decodedMail, reply);
                    });
                },
                function (key, redisData, callback) {
                    if (redisData === req.query.id) {
                        res.redirect('/users/verified');
                        redisClient.del(key, function (err, reply) {
                            if (err) {
                                return callback(true, "Error in redis");
                            }
                            if (reply !== 1) {
                                return callback(true, "Issue in redis");
                            }
                        });
                    } else {
                        return callback(true, "Invalid token");
                    }
                }
            ], function (err, data) {
                res.send(data);
            });
        });
    } else {
        res.end("<h1>Request is from unknown source</h1>");
    }
});

app.post('/api/emailverify/:id', function (req, res) {
    researcherData.verifyResearcher(req.params.id, function (err) {
        if (err) throw err;
        var rData = {
            isverified: "true"
        };
        res.redirect('/users/verified');
    });
});
app.post('/api/set-trial-state/id/:id/state/:state', function (req, res) {
    trialData.getTrialById(req.params.id, function (err, trial) {
        if (err) throw err;
        if (req.params.state == "created") {
            trial.state = "created";
            trial.datecreated = Date.now();
        } else if (req.params.state == "active") {
            trial.state = "active";
            trial.datestarted = Date.now();
            trial.currentduration = Date.now();
        } else if (req.params.state == "ended") {
            trial.state = "ended";
            trial.dateended = Date.now();
        }
        trial.save();
    });
    res.redirect('/users/trials/' + req.params.id);
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
                    res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

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
    researcherAccount.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, function (err, user) {
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

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password = hash;
                        console.log(user.password);

                        user.save(function (err) {
                            if (err) throw err;
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
                text: 'Hello ' + user.forename + ',' + '\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed to' + user.password + '\n'
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
app.get('/api/get-eligibility', function (req, res) {
    eligibilityData.getEligibility(function (err, result) {
        res.json(result);
    })
});
app.get('/api/get-eligibility/trialid/:trialid', function (req, res) {
    eligibilityData.getEligibilityByTrial(req.params.trialid, function (err, result) {
        res.json(result);
    })
});

//trials
app.post('/api/create-trial', function (req, res) {
    var parameters = req.body;

    var tags = parameters['trial_tags'];
    console.log(tags);
    var trialTags = [];
    for (var i = 0; i < tags.length; i++) {
        trialTags[i] = {tag: tags[i]}
    }

    //separate trial params
    var trialParams = {
        title: parameters['trial_title'],
        briefdescription: parameters['trial_briefdesc'],
        detaileddescription: parameters['trial_longdesc'],
        trialtype: parameters['trial_type'],
        institute: req.user['institute'],
        tags: trialTags,
        duration: parameters['trial_duration'],
        frequency: parameters['trial_frequency'],
        waiverform: parameters['trial_waiverform'],
        datecreated: Date.now(),
        datestarted: 0,
        dateended: 0,
        candidatequota: parameters['trial_quota'],
        state: "created",
        researcherid: req.user['id'],
        currentduration: 0,
        lastwindow: 0,
        has_eligibility: "false",
        min_pass_mark: 0
    };

    //trial parsing done
    trialData.createTrial(new trialData(trialParams), function () {
        trialData.getLatestTrialByResearcher(req.user.id, function (err, latestTrial) {
            if(err) throw err;
            var trial_id = latestTrial._id;

            //scrub everything but questions
            var questionDetails = {};
            for (var k in parameters) {
                var result = k.includes("trial_") || k.includes("e-");
                if (!result) questionDetails[k] = parameters[k];
            }

            console.log(questionDetails);

            var indices = Object.keys(questionDetails);
            console.log(indices);
            var maxIndex = 0;
            for (var index = 0; index < indices.length; index++) {
                var currIndex = parseInt(indices[index].match(/\d+/));
                if (currIndex > maxIndex) maxIndex = currIndex;
            }

            console.log(maxIndex + " is the maximum question index");

            for (var qIndex = 0; qIndex < maxIndex; qIndex++) {
                var question = {};
                var answers = [];
                var thisIndex = qIndex + 1;
                for (var att in questionDetails) {
                    if (att === "q" + thisIndex + "_title") {
                        question["title"] = questionDetails[att]
                    } else if (att === "q" + thisIndex + "_type") {
                        question["question_type"] = questionDetails[att]
                    } else if (att === "q" + thisIndex + "_ans[]") {
                        for (var q = 0; q < att.length; q++) {
                            var answer = questionDetails[att][q];
                            if (answer != undefined) answers[q] = {"answer": answer};
                        }
                    }
                }
                question['index'] = qIndex;
                question['trialid'] = trial_id;
                if (answers.length > 0) question['answers'] = answers;

                questionData.createQuestion(new questionData(question));

                //question parsing done

                var eligibilityDetails = {};
                for (var e_k in parameters) {
                    var e_result = e_k.includes("e-");
                    if (e_result) eligibilityDetails[e_k] = parameters[e_k];
                }

                console.log(eligibilityDetails);

                var e_indices = Object.keys(eligibilityDetails);
                console.log(e_indices);
                var e_maxIndex = 0;
                for (var e_index = 0; e_index < e_indices.length; e_index++) {
                    var e_currIndex = parseInt(e_indices[e_index].match(/\d+/));
                    if (e_currIndex > e_maxIndex) e_maxIndex = e_currIndex;
                }

                console.log(e_maxIndex + " is the maximum eligibility question index");

                if (e_maxIndex > 0) {
                    //modify the trial to set has_eligibility to true
                    for (var e_qIndex = 0; e_qIndex < e_maxIndex; e_qIndex++) {
                        var e_question = {};
                        var e_answers = [];
                        var e_thisIndex = e_qIndex + 1;
                        for (var att in eligibilityDetails) {
                            if (att === "e-q" + e_thisIndex + "_title") {
                                e_question["title"] = eligibilityDetails[att]
                            } else if (att === "e-q" + e_thisIndex + "_type") {
                                e_question["question_type"] = eligibilityDetails[att]
                            } else if (att === "e-q" + e_thisIndex + "_ans[]") {
                                for (var e_q = 0; e_q < att.length; e_q++) {
                                    var e_answer = eligibilityDetails[att][e_q];
                                    if (e_answer != undefined) e_answers[e_q] = {
                                        "answer": e_answer,
                                        "score": eligibilityDetails["e-q" + e_thisIndex + "_scores[]"][e_q]
                                    };
                                }
                            }
                        }
                        e_question['index'] = e_qIndex;
                        e_question['trialid'] = trial_id;
                        if (e_answers.length > 0) e_question['answers'] = e_answers;
                        eligibilityData.createEligibility(new eligibilityData(e_question));
                    }


                    trialData.updatePassMark(trial_id, parseInt(eligibilityDetails['e-min_pass_mark']), function (err) {
                        if(err) throw err;
                        trialData.updateEligibility(trial_id, 'true', function (err) {
                            if(err) throw err;
                        });
                    });
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
app.get('/api/get-trials/researcherid/:researcherid', function (req, res) {
    trialData.getTrialsByResearcherId(req.params.researcherid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-trials/trialid/:trialid', function (req, res) {
    trialData.getTrialById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.post('/api/delete-trial/:trialid', function (req, res) {
    trialData.deleteTrial(req.params.trialid, function () {
        questionData.deleteQuestions(req.params.trialid, function () {
            eligibilityData.deleteEligibilities(req.params.trialid, function () {
                res.redirect('/users/dashboard');
            });
        });
    });
});

app.post('/verify_can/:id', function (req, res) {
    res.redirect('/users/trials/' + id);
});
app.post('/reject_can/:id', function (req, res) {
    var id = req.body.userid;

    requestedCandidatesData.removeRequestedCandidate(req.params.userid, function (err, rej) {
        if (err) throw err;

    });
    res.redirect('/users/trials/' + id);

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

app.get('/api/subscribe-user/trialid/:trialid/candidateid/:id', function (req, res) {
    candidateAccount.subscribeCandidate(req.params.id, req.params.trialid, function (err) {
        if (err) throw err;
        res.redirect('/users/trials/' + req.params.trialid);
    });
});

//verified candidate lists
app.post('/api/create-verified-candidate/trialid/:trialid/candidateid/:userid', function (req, res) {
    requestedCandidatesData.removeRequestedCandidate(req.params.trialid, req.params.userid, function (err) {
        if (err) throw err;
        var candidateData = {
            trialid: req.params.trialid,
            userid: req.params.userid
        };

        verifiedCandidatesData.create(new verifiedCandidatesData(candidateData, function (err) {
            if (err) throw err;
        }));
        res.redirect('/api/subscribe-user/trialid/' + candidateData.trialid + '/candidateid/' + candidateData.userid);
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
app.get('/api/delete-verified-candidates/trialid/:trialid/id/:_id', function (req, res) {
    verifiedCandidatesData.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        //fuck it -- don't need this rn -- was going to remove verified candidates from list for debug
    })
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
        if (err) throw err;
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

app.get('/api/update-trials-service', function (req, res) {
    trialData.getTrialsByState('active', function (err, trials) {
        if (err) throw err;
        for (var trial in trials) {
            var currentTrial = parseInt(trials[trial]['currentduration'] / (1000 * 60));
            var currentDay = parseInt((Date.now() + (1000 * 60)) / (1000 * 60));
            console.log(currentDay - currentTrial + " mins difference");

            //every 5 mins
            if (currentDay - currentTrial > 5) {
                trialData.getTrialById(trials[trial]['id'], function (err, result) {
                    result.currentduration = Date.now();
                    var window = parseInt(result.lastwindow);
                    window += 1;
                    result.lastwindow = window;
                    console.log(result.lastwindow + " " + result.duration);

                    //check if window is now at end of trial duration
                    if (parseInt(result.lastwindow) > parseInt(result.duration)) {
                        result.state = "ended";
                        result.dateended = Date.now();
                    }

                    result.save();
                })
            }
        }
        res.redirect('/');
    });
});

//scheduling
/*
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob(rule, function () {
    console.log("Invoking scheduler, next update at " + new Date(Date.now() + (1000 * 60)));
    trialData.getTrialsByState('active', function (err, trials) {
        if (err) throw err;
        if (trials.length == 0) {
            console.log("No trials to be updated");
        } else {
            for (var trial in trials) {
                var currentTrial = parseInt(trials[trial]['currentduration'] / (1000 * 60));
                var currentDay = parseInt((Date.now() + (1000 * 60)) / (1000 * 60));

                //update window per day
                //1 min update
                if (currentDay - currentTrial >= 1) {
                    trialData.getTrialById(trials[trial]['id'], function (err, result) {
                        result.currentduration = Date.now();
                        var window = parseInt(result.lastwindow);
                        window += 1;
                        result.lastwindow = window;
                        console.log("Updating record (" + result.title + ")");

                        //check if window is now at end of trial duration
                        if (parseInt(result.lastwindow) >= parseInt(result.duration)) {
                            result.state = "ended";
                            result.dateended = Date.now();
                            console.log("Ending trial (" + result.title + ")");
                        }
                        result.save();
                    });
                } else {
                    console.log("No update");
                }
            }
        }
    })
});*/

app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});


