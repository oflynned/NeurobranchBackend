/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var researcherSchema = mongoose.Schema({
    trialid: String,
    researcherdata: {}
});

var researcherData = module.exports = mongoose.model('Inclusions', researcherSchema);

module.exports.getExclusions = function (callback) {
    researcherData.find(callback).sort({$natural:-1});
};

module.exports.getExclusionsWithLimit = function (limit, callback) {
    researcherData.find(callback).skip(researcherData - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createExclusions = function (researcherData, callback) {
    researcherData.save(callback);
};

module.exports.getExclusionsById = function (id, callback) {
    researcherData.findOne({trialid: id}, callback);
};
