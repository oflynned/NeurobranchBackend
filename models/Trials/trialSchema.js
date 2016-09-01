/**
 * Created by ed on 01/08/16.
 */

/**
* This schema contains the specific meta data about a trial
*/

var mongoose = require('mongoose');

var trialSchema = mongoose.Schema({
    title: String,
    briefdescription: String,
    detaileddescription: String,
    trialtype: String,
    institute: String,
    condition: String,
    duration: String,
    frequency: String,
    screening: String,
    form1: String,
    datecreated: String,
    datepublished: String,
    datestarted: String,
    dateended: String,
    candidatequota: String,
    state: String,
    researcherid: String
});

var trialData = module.exports = mongoose.model('Trials', trialSchema);

module.exports.getTrials = function (callback) {
    trialData.find(callback).sort({$natural:-1});
};

module.exports.getTrialsWithLimit = function (limit, callback) {
    trialData.find(callback).skip(trialData - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createTrial = function (trialData, callback) {
    trialData.save(callback);
};

module.exports.getTrialById = function (id, callback) {
    trialData.findOne({_id: id}, callback);
};

module.exports.getTrialsByResearcherId = function (researcherid, callback) {
    trialData.find({researcherid: researcherid}, callback).sort({$natural:-1});
};

module.exports.getLatestTrialByResearcher = function (researcherid, callback) {
    trialData.find({researcherid: researcherid}, callback).sort({$natural:-1}).limit(1).select("_id");
};


