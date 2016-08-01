/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');

var epochSchema = mongoose.Schema({
    trialid: String,
    start: String,
    end: String
});

var epoch = module.exports = mongoose.model('Epochs', epochSchema);

module.exports.getEpochs = function (callback) {
    epoch.find(callback).sort({$natural:-1});
};

module.exports.getEpochsWithLimit = function (limit, callback) {
    epoch.find(callback).skip(epoch - limit).sort({$natural:-1}).limit(limit);
};

module.exports.createEpoch = function (epoch, callback) {
    epoch.save(callback);
};

module.exports.getEpochById = function (id, callback) {
    epoch.findOne({userid: id}, callback);
};
