var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	forename: {
		type: String,
		safe: true
	},
	surname: {
		type: String,
		safe: true
	},
	username : {
		type: String,
		unique: true,
		safe: true
	},
	//TODO SPINNER OF ORGANISATIONS
	organisation: {
		type: String,
		safe: true
	},
	password: {
		type: String,
		safe: true
	},
	email: {
		type: String,
		unique: true,
		safe: true
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

//get trialdata
module.exports.getUser = function (callback, limit) {
	User.find(callback).limit(limit);
};

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
};

module.exports.getUserByUsername = function(username, callback){
	var query = {
		username: username
	};	
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
};
