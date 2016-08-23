/**
 * Created by ed on 01/08/16.
 */

/**
 * This schema is created for the allocation of a sharing function of trial between different researchers
 */
var mongoose = require('mongoose');

var researcherSchema = mongoose.Schema({
    trialid: String,
    researcherdata: {}
});

var researcherData = module.exports = mongoose.model('Researchers', researcherSchema);

module.exports.getResearchers = function (callback) {
    researcherData.find(callback).sort({$natural:-1});
};

module.exports.getResearchersWithLimit = function (limit, callback) {
    researcherData.find(callback).skip(researcherData - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createResearchers = function (researcherData, callback) {
    researcherData.save(callback);
};

module.exports.getResearchersById = function (id, callback) {
    researcherData.find({_id: id}, callback);
};

module.exports.getResearchersById = function (trialid, callback) {
    researcherData.find({trialid: trialid}, callback);
};
