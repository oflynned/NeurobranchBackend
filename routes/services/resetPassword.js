/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let bcrypt = require('bcrypt');
let Email = require("./email");

function confirmResetPassword(req, res, done, researcherAccount) {
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
                        Email.confirmResetPassword(user, res);
                        done(err, user);
                    });
                });
            });
        });
    });
}

module.exports = {
    confirmResetPassword: confirmResetPassword
};