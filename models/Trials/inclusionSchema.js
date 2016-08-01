/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var inclusionSchema = mongoose.Schema({
    trialid: String,
    inclusions: {}
});

var inclusion = module.exports = mongoose.model('Inclusions', inclusionSchema);

module.exports.getExclusions = function (callback) {
    inclusion.find(callback).sort({$natural:-1});
};

module.exports.getExclusionsWithLimit = function (limit, callback) {
    inclusion.find(callback).skip(inclusion - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createExclusions = function (epoch, callback) {
    inclusion.save(callback);
};

module.exports.getExclusionsById = function (id, callback) {
    inclusion.findOne({trialid: id}, callback);
};
