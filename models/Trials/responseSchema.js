/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var responseSchema = mongoose.Schema({
    questionid: String,
    candidateid: String,
    responses: {}
});

var response = module.exports = mongoose.model('Responses', responseSchema);

module.exports.getResponses = function (callback) {
    response.find(callback).sort({$natural:-1});
};

module.exports.getResponsesWithLimit = function (limit, callback) {
    response.find(callback).skip(response - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createResponse = function (researcherData, callback) {
    response.save(callback);
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

module.exports.getResponseByQuestionIdCandidateId = function (candidateid, questionid, callback) {
    response.find({candidateid: candidateid, questionid: questionid}, callback);
};