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
    tags: [],
    duration: String,
    frequency: String,
    waiverform: String,
    datecreated: String,
    datepublished: String,
    datestarted: String,
    dateended: String,
    candidatequota: String,
    state: String,
    researcherid: String,
    passmark: String,
    currentduration: String,
    lastwindow: String,
    has_eligibility: String,
    min_pass_mark: String
});

var trialData = module.exports = mongoose.model('Trials', trialSchema);

module.exports.getJoinableTrials = function (callback) {
    trialData.find({state: 'created'}, callback).sort({$natural: -1});
};

module.exports.getAllTrials = function (callback) {
    trialData.find(callback).sort({$natural: -1});
};

module.exports.getTrialsByState = function (state, callback) {
    trialData.find({state: state}, callback);
};

module.exports.getTrialsWithLimit = function (limit, callback) {
    trialData.find(callback).skip(trialData - limit).sort({$natural: -1}).limit(limit);
};

module.exports.createTrial = function (trialData, callback) {
    trialData.save(callback);
};

//update the id associated with the current day to also be stored in responses for reference
module.exports.updateLastWindow = function (id, windowid, callback) {
    trialData.findOneAndUpdate({_id: id, state: 'active'}, {lastwindow: windowid}, null, callback);
};

//modify the has_eligibility state
module.exports.updateEligibility = function (id, value, callback) {
    trialData.findOneAndUpdate({_id: id}, {has_eligibility: value}, null, callback);
};

//modify the has_eligibility state
module.exports.updatePassMark = function (id, value, callback) {
    trialData.findOneAndUpdate({_id: id}, {min_pass_mark: value}, null, callback);
};

//update the last day of the window at 00:00 by checking a change in the day
module.exports.updateCurrentDuration = function (id, newTime, callback) {
    trialData.findOneAndUpdate({_id: id, state: 'active'}, {currentduration: newTime}, null, callback);
};

module.exports.deleteTrial = function (id, callback) {
    trialData.findOneAndRemove({_id: id}, callback);
};

module.exports.getTrialById = function (id, callback) {
    trialData.findOne({_id: id}, callback);
};

module.exports.getTrialsByList = function (list, callback) {
    trialData.find({_id: {$in: list}}, callback).sort({$natural: -1});
};

module.exports.getTrialsByListState = function (list, state, callback) {
    trialData.find({_id: {$in: list}, state: state}, callback).sort({$natural: -1});
};

module.exports.getTrialsByListExcludingState = function (list, state, callback) {
    trialData.find({_id: {$in: list}, state: {$nin: state}}, callback).sort({$natural: -1});
};

module.exports.getTrialsByExcluded = function (list, callback) {
    trialData.find({_id: {$nin: list}, state: 'created'}, callback).sort({$natural: -1});
};

module.exports.getTrialsByListStateNotInList = function (list, state, callback) {
    trialData.find({_id: {$nin: list}, state: state}, callback).sort({$natural: -1});
};

module.exports.getTrialsByResearcherId = function (researcherid, callback) {
    trialData.find({researcherid: researcherid}, callback).sort({$natural: -1});
};

module.exports.getLatestTrialByResearcher = function (researcherid, callback) {
    trialData.findOne({researcherid: researcherid}, callback).sort({$natural: -1}).select("_id");
};
module.exports.findAllTrials = function (callback) {
    trialData.find(callback);
};

