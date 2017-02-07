/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Redis = require("redis");
let RedisClient = Redis.createClient();
let Nodemailer = require("nodemailer");
let Constants = require("../Globals");

let SMTP = Nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: Constants.email,
        pass: Constants.password
    }
});

function verifyEmail(req, result) {
    let rand = result.id;
    let encodedMail = new Buffer(req.body.to).toString("base64");
    let link = "http://" + req.get("host") + "/verify?mail=" + encodedMail + "&id=" + rand;

    let mailOptions = {
        to: req.body.to,
        from: Constants.email,
        subject: "Confirm Your Neurobranch Account",
        html: "Hey " + req.body.forename + "!" +
        "<br><br>" +
        "Thanks for joining Neurobranch, welcome to the world of more accurate and meaningful clinical trials!" +
        "<br>" +
        "Please click <a href=" + link + " target=\"_blank\">here</a> to verify your email and change the world." +
        "<br><br>" +
        "(or copy and paste the following raw URL into your browser)" +
        "<br><a href=" + link + " target=\"_blank\">" + link + "</a>" +
        "<br><br>" +
        "~ The Neurobranch Team"
    };

    SMTP.sendMail(mailOptions, function () {
        RedisClient.set(req.body.to, Constants.secret);
        RedisClient.expire(req.body.to, Constants.emailExpiry);
    });
}

function forgottenPassword(user, req, res) {
    let link = "http://" + req.get("host") + "/reset/" + user.resetPasswordToken;
    
    let mailOptions = {
        to: user.email,
        from: Constants.email,
        subject: "Neurobranch Password Reset",
        html: "Hey again " + user.forename + "," +
        "<br><br>" +
        "You are receiving this because you (or someone else) have requested the reset of the password for your account." +
        "<br><br>" +
        "Please click on the following link, or paste this into your browser to complete the process:" +
        "<br>" +
        "<a href=" + link + " target=\"_blank\">" + link + "</a>" +
        "<br><br>" +
        "If you did not request this, please ignore this email and your password will remain unchanged." +
        "<br><br>" +
        "~ The Neurobranch Team"
    };

    SMTP.sendMail(mailOptions, function () {
        res.redirect("/users/login");
    });
}

function greetUser(user, res) {
    let mailOptions = {
        to: user.email,
        from: Constants.email,
        subject: "Welcome to Neurobranch!",
        html: "Hey " + user.forename + "," +
        "<br><br>" +
        "Thanks for confirming your account, and welcome to Neurobranch!" +
        "<br>" +
        "We hope you enjoy your time here - take some time to have a look around our site to see the latest and " +
        "greatest developments in clinical trials today. Help be part of the wider community, and be part of the solution :)" +
        "<br><br>" +
        "~ The Neurobranch Team"
    };

    SMTP.sendMail(mailOptions, null);
    res.redirect("/users/login");
}

function confirmResetPassword(user, res) {
    let mailOptions = {
        to: user.email,
        from: Constants.email,
        subject: "Neurobranch Password Changed",
        html: "Hey again, " + user.forename + "!" +
        "<br><br>" +
        "This is a confirmation that you have successfully changed the password to your account. " +
        "We hope you enjoy your time here - take some time to have a look around our site to see the latest and " +
        "greatest developments in clinical trials today. Help be part of the wider community, and be part of the solution :)" +
        "<br><br>" +
        "~ The Neurobranch Team"
    };

    SMTP.sendMail(mailOptions, function () {
        res.redirect("/users/login");
    });
}

module.exports = {
    greetUser: greetUser,
    verifyEmail: verifyEmail,
    confirmResetPassword: confirmResetPassword,
    forgottenPassword: forgottenPassword
};
