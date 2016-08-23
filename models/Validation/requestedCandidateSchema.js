/**
 * Created by ed on 01/08/16.
 */
/**
 * This schema exists to support the x amount of candidates applieying to a trial
 */
var mongoose = require('mongoose');

var requestedCandidateSchema = mongoose.Schema({
    trialid: String,
    users: {}
});

var requestedCandidates = module.exports = mongoose.model('RequestedCandidates', requestedCandidateSchema);

module.exports.getRequestedCandidates = function (callback) {
    requestedCandidates.find(callback).sort({$natural:-1});
};

module.exports.getRequestedCandidatesWithLimit = function (limit, callback) {
    requestedCandidates.find(callback).skip(requestedCandidates - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createRequestedCandidates = function (requestedCandidates, callback) {
    requestedCandidates.save(callback);
};

module.exports.getRequestedCandidatesByTrialId = function (id, callback) {
    requestedCandidates.find({trialid: id}, callback);
};

module.exports.getRequestedCandidatesById = function (id, callback) {
    requestedCandidates.find({_id: id}, callback);
};
