/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var candidateAccountSchema = mongoose.Schema({
    password: {
        type: String,
        safe: true
    },
    email: {
        type: String,
        unique: true,
        safe: true
    }
    //conditions: [conditions]
});

var candidate = module.exports = mongoose.model('CandidateAccounts', candidateAccountSchema);

module.exports.getCandidatesWithLimit = function (limit, callback) {
    candidate.find(callback).skip(candidate - limit).sort({$natural:-1}).limit(limit);
};

module.exports.getCandidates = function (callback) {
    candidate.find(callback).sort({$natural:-1});
};

module.exports.createCandidate = function (newCandidate, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newCandidate.password, salt, function (err, hash) {
            newCandidate.password = hash;
            newCandidate.save(callback);
        });
    });
};

module.exports.getCandidateById = function (id, callback) {
    candidate.findOne({_id: id}, callback);
};

module.exports.getCandidateByEmail = function (email, callback) {
    candidate.findOne({email: email}, callback);
};

module.exports.comparePasswords = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};
