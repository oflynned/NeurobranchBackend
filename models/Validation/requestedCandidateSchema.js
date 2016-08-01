/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var requestedCandidateSchema = mongoose.Schema({
    trialid: String,
    users: {}
});

var requestedCandidates = module.exports = mongoose.model('RequestedCandidates', requestedCandidateSchema);

module.exports.getConditions = function (callback) {
    requestedCandidates.find(callback).sort({$natural:-1});
};

module.exports.getConditionsWithLimit = function (limit, callback) {
    requestedCandidates.find(callback).skip(requestedCandidates - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createCondition = function (requestedCandidates, callback) {
    requestedCandidates.save(callback);
};

module.exports.getConditionById = function (id, callback) {
    requestedCandidates.findOne({userid: id}, callback);
};
