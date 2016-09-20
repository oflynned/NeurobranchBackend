/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var researcherAccountSchema = mongoose.Schema({
    forename: {
        type: String,
        safe: true
    },
    surname: {
        type: String,
        safe: true
    },
    username: {
        type: String,
        unique: true,
        safe: true
    },
    email: {
        type: String,
        unique: true,
        safe: true
    },
    password: {
        type: String,
        safe: true
    },
    institute: {
        type: String,
        safe: true
    },
    datecreated: {
        type: String,
        safe: true
    },
    resetPasswordToken: {
        type: String,
        safe: true
    },
    resetPasswordExpires: {
        type:Date,
        safe:true
    },
    isverified: {
        type: String,
        safe: true
    }
});

var researcher = module.exports = mongoose.model('ResearcherAccounts', researcherAccountSchema);

module.exports.getResearchersWithLimit = function (limit, callback) {
    researcher.find(callback).skip(researcher - limit).sort({$natural:-1}).limit(limit);
};

module.exports.getResearcher = function (callback) {
    researcher.find(callback).sort({$natural:-1});
};

module.exports.verifyResearcher = function (researcherid, status, callback) {
    researcher.find({researcherid: researcherid}, callback);
};

module.exports.createResearcher = function (newCandidate, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newCandidate.password, salt, function (err, hash) {
            newCandidate.password = hash;
            newCandidate.save(callback);
        });
    });
};

module.exports.getResearcherById = function (id, callback) {
    researcher.findOne({_id: id}, callback);
};

module.exports.getResearcherByEmail = function (email, callback) {
    researcher.findOne({email: email}, callback);
};

module.exports.getResearcherByUsername = function (username, callback) {
    researcher.findOne({username: username}, callback);
};

module.exports.comparePasswords = function (researcherPassword, hash, callback) {
    bcrypt.compare(researcherPassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};
module.exports.findAllResearcher = function (callback) {
    researcher.find(callback);
};