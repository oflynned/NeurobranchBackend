/**
 * Created by ed on 01/08/16.
 */

/**
 * This schema is created for the capturing of answers from the different candidates for the different questions
 */
var mongoose = require('mongoose');

var responseSchema = mongoose.Schema({
    trialid: String,
    questionid: String,
    candidateid: String,
    window: String,
    question_type: String,
    index: String,
    response: []
});

var response = module.exports = mongoose.model('Responses', responseSchema);

module.exports.getResponses = function (callback) {
    response.find(callback).sort({$natural:-1});
};

module.exports.getResponsesWithLimit = function (limit, callback) {
    response.find(callback).skip(response - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createResponse = function (responseData, callback) {
    responseData.save(callback);
};

module.exports.getResponseById = function (id, callback) {
    response.find({_id: id}, callback);
};

module.exports.getResponseByQuestionId = function (questionid, callback) {
    response.find({questionid: questionid}, callback);
};

module.exports.getResponseByCandidateId = function (candidateid, callback) {
    response.find({candidateid: candidateid}, callback);
};

module.exports.getResponseByCandidateIdTrialList = function (candidateid, trialList, callback) {
    response.find({candidateid: candidateid, trialid: {$in: trialList}}, callback);
};

module.exports.getResponseMostRecentWindow = function (trialid, candidateid, callback) {
    response.find({trialid: trialid, candidateid: candidateid}, callback).sort({$natural:-1}).limit(1).select("window");
};

module.exports.getResponseByTrialId = function (trialid, callback) {
    response.find({trialid: trialid}, callback);
};

module.exports.getResponseByQuestionIdCandidateId = function (candidateid, questionid, callback) {
    response.find({candidateid: candidateid, questionid: questionid}, callback);
};

module.exports.getResponseByTrialIdCandidateId = function (trialid, candidateid, callback) {
    response.find({trialid: trialid, candidateid: candidateid}, callback);
};

module.exports.deleteResponse = function (id, callback) {
    response.findOneAndRemove({_id: id}, callback);
};