/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var trialSchema = mongoose.Schema({
    trialid: String,
    title: String,
    briefdescription: String,
    detaileddescription: String,
    trialtype: String,
    organisation: String,
    condition: String,
    datecreated: String,
    datepublished: String,
    dateactive: String,
    candidatequota: String,
    state: String
});

var trialData = module.exports = mongoose.model('Trials', trialSchema);

module.exports.getExclusions = function (callback) {
    trialData.find(callback).sort({$natural:-1});
};

module.exports.getExclusionsWithLimit = function (limit, callback) {
    trialData.find(callback).skip(trialData - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createExclusions = function (trialData, callback) {
    trialData.save(callback);
};

module.exports.getTrialById = function (id, callback) {
    trialData.findOne({_id: id}, callback);
};