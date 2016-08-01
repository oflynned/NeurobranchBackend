/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var responseSchema = mongoose.Schema({
    trialid: String,
    epochid: String,
    questionid: String,
    candidateid: String,
    responses: {}
});

var response = module.exports = mongoose.model('Responses', responseSchema);

module.exports.getExclusions = function (callback) {
    response.find(callback).sort({$natural:-1});
};

module.exports.getExclusionsWithLimit = function (limit, callback) {
    response.find(callback).skip(response - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createExclusions = function (researcherData, callback) {
    response.save(callback);
};

module.exports.getResponseByTrialId = function (id, callback) {
    response.find({trialid: id}, callback);
};

module.exports.getResponseByEpochId = function (id, callback) {
    response.find({epochid: id}, callback);
};

module.exports.getResponseByQuestionId = function (id, callback) {
    response.find({questionid: id}, callback);
};

module.exports.getResponseByCandidateId = function (id, callback) {
    response.find({candidateid: id}, callback);
};

module.exports.getResponseByQuestionAndCandidateId = function (candidateid, questionid, callback) {
    response.find({candidateid: candidateid, questionid: questionid}, callback);
};

module.exports.getResponseByEpochAndCandidateId = function (epochid, questionid, callback) {
    response.find({epochid: epochid, questionid: questionid}, callback);
};

module.exports.getResponseByTrialAndCandidateId = function (trialid, questionid, callback) {
    response.find({trialid: trialid, questionid: questionid}, callback);
};

module.exports.getResponseByAllAttributes = function (trialid, questionid, epochid, candidateid, callback) {
    response.find({
        trialid: trialid,
        questionid: questionid,
        epochid: epochid,
        candidateid: candidateid
    }, callback);
};