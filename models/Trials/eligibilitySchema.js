/**
 * Created by ed on 01/08/16.
 */
/**
 * This schema contains the specific metadata about the eligibility being asked
 */

var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
    title: String,
});

var eligibilitySchema = mongoose.Schema({
    trialid: String,
    candidateid: String,
    researcherid: String,
    passmark: String,
    mark: String,
    answers: []
});

var eligibility = module.exports = mongoose.model('Eligibility', eligibilitySchema);

module.exports.getEligibility = function (callback) {
    eligibility.find(callback).sort({$natural:-1});
};

module.exports.getEligibilityWithLimit = function (limit, callback) {
    eligibility.find(callback).skip(eligibility - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createEligibility = function (eligibility, callback) {
    eligibility.save(callback);
};

module.exports.getEligibilityById = function (id, callback) {
    eligibility.find({_id: id}, callback);
};

module.exports.getEligibilityByTrialCandidate = function (trialid, candidateid, callback) {
    eligibility.find({trialid: trialid, candidateid: candidateid}, callback);
};
