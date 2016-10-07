/**
 * Created by ed on 01/08/16.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var administratorAccountSchema = mongoose.Schema({
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

var administrator = module.exports = mongoose.model('AdministratorAccounts', administratorAccountSchema);

module.exports.getAdministratorsWithLimit = function (limit, callback) {
    administrator.find(callback).skip(administrator - limit).sort({$natural:-1}).limit(limit);
};

module.exports.getAdministrator = function (callback) {
    administrator.find(callback).sort({$natural:-1});
};

module.exports.verifyAdministrator = function (administratorid, status, callback) {
    administrator.find({administratorid: administratorid}, callback);
};

module.exports.createAdministrator = function (newCandidate, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newCandidate.password, salt, function (err, hash) {
            newCandidate.password = hash;
            newCandidate.save(callback);
        });
    });
};

module.exports.getAdministratorById = function (id, callback) {
    administrator.findOne({_id: id}, callback);
};

module.exports.getAdministratorByEmail = function (email, callback) {
    administrator.findOne({email: email}, callback);
};

module.exports.getAdministratorByUsername = function (username, callback) {
    administrator.findOne({username: username}, callback);
};

module.exports.comparePasswords = function (administratorPassword, hash, callback) {
    bcrypt.compare(administratorPassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};
module.exports.findAllAdministrator = function (callback) {
    administrator.find(callback);
};