/**
 * Created by ed on 01/08/16.
 */
/**
 * This schema exists to support the n amount of candidates accepted to a trial
 */
var mongoose = require('mongoose');

var verifiedCandidateSchema = mongoose.Schema({
    trialid: String,
    userid: String
});

var verifiedCandidates = module.exports = mongoose.model('VerifiedCandidates', verifiedCandidateSchema);

module.exports.getVerifiedCandidates = function (callback) {
    verifiedCandidates.find(callback).sort({$natural:-1});
};

module.exports.getVerifiedCandidatesWithLimit = function (limit, callback) {
    verifiedCandidates.find(callback).skip(verifiedCandidates - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createVerifiedCandidates = function (verifiedCandidates, callback) {
    verifiedCandidates.save(callback);
};

module.exports.getVerifiedCandidatesByTrialId = function (id, callback) {
    verifiedCandidates.find({trialid: id}, callback);
};

module.exports.getVerifiedCandidatesById = function (id, callback) {
    verifiedCandidates.find({_id: id}, callback);
};
