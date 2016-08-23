/**
 * Created by ed on 01/08/16.
 */
/**
 * This schema exists to support the n amount of inclusion criteria found in a  trial
 */
var mongoose = require('mongoose');

var inclusionSchema = mongoose.Schema({
    trialid: String,
    inclusions: {}
});

var inclusion = module.exports = mongoose.model('Inclusions', inclusionSchema);

module.exports.getInclusions = function (callback) {
    inclusion.find(callback).sort({$natural:-1});
};

module.exports.getInclusionsWithLimit = function (limit, callback) {
    inclusion.find(callback).skip(inclusion - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createInclusions = function (inclusion, callback) {
    inclusion.save(callback);
};

module.exports.getInclusionsById = function (id, callback) {
    inclusion.findOne({trialid: id}, callback);
};
