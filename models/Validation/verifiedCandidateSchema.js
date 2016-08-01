/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var verifiedCandidateSchema = mongoose.Schema({
    trialid: String,
    users: {}
});

var verifiedCandidates = module.exports = mongoose.model('VerifiedCandidates', verifiedCandidateSchema);

module.exports.getConditions = function (callback) {
    verifiedCandidates.find(callback).sort({$natural:-1});
};

module.exports.getConditionsWithLimit = function (limit, callback) {
    verifiedCandidates.find(callback).skip(verifiedCandidates - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createCondition = function (verifiedCandidates, callback) {
    verifiedCandidates.save(callback);
};

module.exports.getConditionById = function (id, callback) {
    verifiedCandidates.findOne({userid: id}, callback);
};
