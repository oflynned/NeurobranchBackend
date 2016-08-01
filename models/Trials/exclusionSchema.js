/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var exclusionSchema = mongoose.Schema({
    trialid: String,
    exclusions: {}
});

var exclusion = module.exports = mongoose.model('Exclusions', exclusionSchema);

module.exports.getExclusions = function (callback) {
    exclusion.find(callback).sort({$natural:-1});
};

module.exports.getExclusionsWithLimit = function (limit, callback) {
    exclusion.find(callback).skip(exclusion - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createExclusions = function (epoch, callback) {
    exclusion.save(callback);
};

module.exports.getExclusionsById = function (id, callback) {
    exclusion.findOne({trialid: id}, callback);
};
