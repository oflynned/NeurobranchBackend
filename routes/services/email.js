/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Redis = require('redis');
let RedisClient = Redis.createClient();
let Nodemailer = require("nodemailer");
let Constants = require("../logic/debugVariables");

let SMTP = Nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: Constants.email,
        pass: "lCk3TN:68w4Yn8C"
    }
});

function verifyEmail(req, result) {
    let rand = result.id;
    let encodedMail = new Buffer(req.body.to).toString('base64');
    let link = "http://" + req.get('host') + "/verify?mail=" + encodedMail + "&id=" + rand;

    let mailOptions = {
        //need to change this to route53 on AWS before launch
        from: Constants.email,
        to: req.body.to,
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

    SMTP.sendMail(mailOptions, function () {
        RedisClient.set(req.body.to, Constants.secret);
        RedisClient.expire(req.body.to, Constants.emailExpiry);
    });
}

function forgottenPassword(user, callback) {
    let mailOptions = {
        to: user.email,
        from: Constants.email,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
        callback();
    });
}

function greetUser() {

}

function confirmResetPassword(user) {
    let mailOptions = {
        to: user.email,
        from: 'teztneuro@gmail.com',
        subject: 'Neurobranch Password Changed',
        text: "Hey again, " + user.forename + "!" +
        "<br><br>" +
        "This is a confirmation that you have successfully changed the password to your account." +
        "<br><br>" +
        "~ The Neurobranch Team"
    };

    smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
    });
}

module.exports = {
    greetUser: greetUser,
    verifyEmail: verifyEmail,
    confirmResetPassword: confirmResetPassword,
    forgottenPassword: forgottenPassword
};
