/**
 * Created by ed on 01/08/16.
 */
/**
 * This scheama contains the specific metadata about the eligibility being asked
 */

var mongoose = require('mongoose');

var eligibilitySchema = mongoose.Schema({
    trialid: String,
    eligibilitytype: String,
    title: String,
    answers: {}
});

var eligibility = module.exports = mongoose.model('eligibilitys', eligibilitySchema);

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

module.exports.getEligibilityByTrialId = function (trialid, callback) {
    eligibility.find({trialid: trialid}, callback);
};

module.exports.getEligibilityByAllParams = function (eligibilityid, trialid, callback) {
    eligibility.find({trialid: trialid, _id: eligibilityid}, callback);
};
