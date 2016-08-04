/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var conditionSchema = mongoose.Schema({
    userid: {
        type: String,
        ref: 'CandidateAccounts'
    },
    conditions: {}
});

var conditions = module.exports = mongoose.model('Conditions', conditionSchema);

module.exports.getConditions = function (callback) {
    conditions.find(callback).sort({$natural:-1});
};

module.exports.getConditionsWithLimit = function (limit, callback) {
    conditions.find(callback).skip(conditions - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createCondition = function (condition, callback) {
    condition.save(callback);
};

module.exports.getConditionById = function (id, callback) {
    conditions.findOne({userid: id}, callback);
};
