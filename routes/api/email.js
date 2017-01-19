/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let crypto = require('crypto');
let Email = require("../services/email");
let ResetPassword = require("../services/resetPassword");
let Redis = require('redis');
let RedisClient = Redis.createClient();

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/emailverify/:id', function (req, res) {
    Schemas.researcherData.verifyResearcher(req.params.id, function (err) {
        if (err) throw err;
        res.redirect('/users/verified');
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