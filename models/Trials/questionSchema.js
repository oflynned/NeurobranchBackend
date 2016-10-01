/**
 * Created by ed on 01/08/16.
 */
/**
 * This scheama contains the specific metadata about the questions being asked
 */

var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
    trialid: String,
    question_type: String,
    title: String,
    index: String,
    answers: []
});

var question = module.exports = mongoose.model('Questions', questionSchema);

module.exports.getQuestions = function (callback) {
    question.find(callback).sort({$natural:-1});
};

module.exports.getQuestionsWithLimit = function (limit, callback) {
    question.find(callback).skip(question - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createQuestion = function (question, callback) {
    question.save(callback);
};

module.exports.getQuestionById = function (id, callback) {
    question.find({_id: id}, callback);
};

module.exports.getQuestionsByTrialId = function (trialid, callback) {
    question.find({trialid: trialid}, callback);
};

module.exports.getQuestionByAllParams = function (questionid, trialid, callback) {
    question.find({trialid: trialid, _id: questionid}, callback);
};

module.exports.deleteQuestions = function (trialid, callback) {
    question.remove({trialid: trialid}, callback);
};