var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var responseQuestionSchema = new Schema({

});

var responseDataSchema = new Schema({
    any: mongoose.Schema.Types.Mixed
    /*trialid:{
        type:String,
        required:true
    },
    candidateid:{
        type:String,
        required:true
    },
    epochid:{
        type:String,
        required:true
    },
    response:[mongoose.Schema.Types.Mixed]*/
}, {strict: false});

var responseData = module.exports = mongoose.model('responsedata', responseDataSchema, 'responsedata');

//get response
module.exports.getresponseData= function(callback , limit){
    responseData.find(callback).limit(limit);
};

//get one response
module.exports.getresponseDataById= function(id ,callback){
    responseData.findById(id ,callback);
};

//add response
module.exports.addResponseData = function(model, value, callback){
    model.create(value, callback);
};

