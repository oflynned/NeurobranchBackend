/**
 * Created by ed on 01/08/16.
 */
"use strict";
let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

let candidateAccountSchema = mongoose.Schema({
    password: {
        type: String,
        safe: true
    },
    email: {
        type: String,
        unique: true,
        safe: true
    },
    isverified: {
        type: String,
        safe: true
    },
    trialrequested: {
        type: String,
        safe: true
    },
    trialverified: {
        type: String,
        safe: true
    },
    //contains trial ids for query on server
    subscribed: [],
    //used for demarcating trials to not show under trials available, with all trials ever interacted with added to here for user
    relationship_with: []
});

let candidate = module.exports = mongoose.model('CandidateAccounts', candidateAccountSchema);

module.exports.getCandidatesWithLimit = function (limit, callback) {
    candidate.find(callback).skip(candidate - limit).sort({$natural: -1}).limit(limit);
};

module.exports.getCandidates = function (callback) {
    candidate.find(callback).sort({$natural: -1});
};

module.exports.createCandidate = function (newCandidate, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newCandidate.password, salt, function (err, hash) {
            newCandidate.password = hash;
            newCandidate.save(callback);
        });
    });
};

module.exports.subscribeCandidate = function (candidateid, trialid, callback) {
    candidate.findOneAndUpdate(
        {_id: candidateid},
        {$push: {"subscribed": {trialid: trialid}}},
        {safe: true, upsert: true, new: true},
        callback);
};

module.exports.getCandidateById = function (id, callback) {
    candidate.findOne({_id: id}, callback);
};

module.exports.getCandidateByEmail = function (email, callback) {
    candidate.findOne({email: email}, callback);
};

module.exports.comparePasswords = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.addTrialRelationship = function (candidateid, trialid, callback) {
    candidate.findOneAndUpdate(
        {_id: candidateid},
        {$push: {"relationship_with": {trialid: trialid}}},
        {safe: true, upsert: true, new: true},
        callback
    );
};
