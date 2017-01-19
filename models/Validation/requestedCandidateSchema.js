/**
 * Created by ed on 01/08/16.
 */
"use strict";
/**
 * This schema exists to support the x amount of candidates applying to a trial
 */
let mongoose = require('mongoose');

let requestedCandidateSchema = mongoose.Schema({
    trialid: String,
    userid: String
});

let requestedCandidates = module.exports = mongoose.model('RequestedCandidates', requestedCandidateSchema);

module.exports.getRequestedCandidates = function (callback) {
    requestedCandidates.find(callback).sort({$natural:-1});
};

module.exports.getRequestedCandidatesWithLimit = function (limit, callback) {
    requestedCandidates.find(callback).skip(requestedCandidates - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createRequestedCandidates = function (requestedCandidate, callback) {
    requestedCandidate.save(callback);
};

module.exports.getRequestedCandidatesByTrialId = function (trialid, callback) {
    requestedCandidates.find({trialid: trialid}, callback).sort({$natural:-1});
};

module.exports.getRequestedCandidatesByUserId = function (userid, callback) {
    requestedCandidates.find({userid: userid}, callback).sort({$natural:-1});
};

module.exports.removeRequestedCandidate = function (trialid, userid, callback) {
    requestedCandidates.findOneAndRemove({trialid: trialid, userid: userid}, callback);
};

module.exports.getRequestedCandidatesById = function (id, callback) {
    requestedCandidates.find({_id: id}, callback);
};

