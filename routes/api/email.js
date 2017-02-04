/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let crypto = require('crypto');
let Email = require("../services/email");
let ResetPassword = require("../services/resetPassword");

let Constants = require("../Globals");

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();
let async = require("async");

let Redis = require('redis');
let RedisClient = Redis.createClient();
let Nodemailer = require("nodemailer");
let smtpTransport = Nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: Constants.email,
        pass: Constants.password
    }
});

app.post('/api/emailverify/:id', function (req, res) {
    Schemas.researcherData.verifyResearcher(req.params.id, function (err) {
        if (err) throw err;
        res.redirect('/users/verified');
    });
});

/**
 * Holy shit no, time is against us so I am not dealing with this insane mess now
 */
app.post('/send', function (req, res) {
    console.log(req.body);
    req.body["email"] = req.body.to;
    req.body["isverified"] = !Constants.shouldVerifyUsers;

    Schemas.researcherAccount.createResearcher(new Schemas.researcherAccount(req.body), function (err, reresult) {
        if (Constants.shouldSendEmail) {
            async.waterfall([function (callback) {
                RedisClient.exists(req.body.to, function (err, reply) {
                    if (err) {
                        return callback(true, "Error in redis");
                    }
                    if (reply === 1) {
                        return callback(true, "Email already requested");
                    }
                    callback(null);
                });
            }, function (callback) {
                let rand = reresult.id;
                let encodedMail = new Buffer(req.body.to).toString('base64');
                let link = "http://" + req.get('host') + "/verify?mail=" + encodedMail + "&id=" + rand;
                let mailOptions = {
                    to: req.body.to,
                    from: Constants.email,
                    subject: "Confirm Your Neurobranch Account",
                    html: "Hey, " + req.body.forename + "!" +
                    "<br><br>" +
                    "Thanks for joining Neurobranch, welcome to the world of more accurate and meaningful clinical trials!" +
                    "<br>" +
                    "Please click <a href=" + link + ">here</a> to verify your email and change the world." +
                    "<br><br>" +
                    "(or copy and paste the following raw URL into your browser)" +
                    "<br><a href=" + link + ">" + link + "</a>" +
                    "<br><br>" +
                    "~ The Neurobranch Team"
                };
                callback(null, mailOptions, rand);
            }, function (mailData, secretKey, callback) {
                smtpTransport.sendMail(mailData, function (error, response) {
                    if (error) {
                        console.log(error);
                        return callback(true, "Error in sending email");
                    }
                    console.log("Message sent: " + JSON.stringify(response));
                    RedisClient.set(req.body.to, secretKey);
                    RedisClient.expire(req.body.to, 600); // expiry for 10 minutes.
                    callback(null, "Email sent Successfully");
                });
            }], function (err, data) {
                console.log(err, data);
                res.json({error: err !== null, data: data});
            });
        }
        res.redirect("/users/login");
    });
});

app.get('/verify', function (req, res) {
    Schemas.researcherAccount.getResearcherById(req.query.id, function (err, reverify) {
        reverify.isverified = "true";
        reverify.save();

        let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');

        RedisClient.get(decodedMail, function (err, redisData) {
            if (redisData === req.query.id) {
                res.redirect('/users/verified');
            } else {
                res.redirect('/');
            }
        });
    });
});

app.post('/forgot', function (req, res) {
    crypto.randomBytes(20, function (err, buf) {
        let token = buf.toString('hex');
        Schemas.researcherAccount.findOne({email: req.body.email}, function (err, user) {
            if (!user) {
                console.log('No account with that email address exists.');
                req.flash('error', 'No account with that email address exists.');
                res.redirect('/forgot');
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000;

            user.save(function () {
                Email.forgottenPassword(user, function () {
                    res.redirect("/");
                });
            });
        });
    });
});

app.get('/reset/:token', function (req, res) {
    Schemas.researcherAccount.findOne({
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
    ResetPassword.confirmResetPassword(req, res, Schemas.researcherAccount);
});


module.exports = app;