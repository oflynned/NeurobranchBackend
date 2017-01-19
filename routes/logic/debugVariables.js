/**
 * Created by ed on 18/01/2017.
 */
"use strict";
const requireVerified = false;
const verifyEmail = false;
const updateTrialStates = false;

const email = "teztneuro@gmail.com"; // "noreply@neurobranch.com";
const emailExpiry = 60 * 24; // 24 hours

const secret = "secret";

module.exports = {
    requireVerified: requireVerified,
    verifyEmail: verifyEmail,
    updateTrialStates: updateTrialStates,
    email: email,
    emailExpiry: emailExpiry,
    secret: secret
};