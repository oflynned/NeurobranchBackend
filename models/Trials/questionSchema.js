/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
    epochid: String,
    questiontype: String,
    title: String,
    answers: {}
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

module.exports.getQuestionByEpochId = function (epochid, callback) {
    question.find({epochid: epochid}, callback);
};

module.exports.getQuestionByAllParams = function (questionid, epochid, callback) {
    question.find({epochid: epochid, _id: questionid}, callback);
};
