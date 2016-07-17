var mongoose = require('mongoose');
Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var responsedataSchema = mongoose.Schema({
    trialid:{
        type:String,
        required:true
    },
    epochid:{
        type:String,
        required:true
    },
    candidateid:{
        type:String,
        required:true
    },
    response:[{ type:String}],


    create_date:{
        type: Date,
        default:Date.now
    }

});
var responseData =module.exports= mongoose.model('responsedata', responsedataSchema, 'responsedata');


//get response
module.exports.getresponseData= function(callback , limit){
    responseData.find(callback).limit(limit);
}

//get one by _id response
module.exports.getresponseDataById= function(id ,callback){
    responseData.findById(id ,callback);
}

//get one by epochid response
module.exports.getresponseDataByEpochId= function(epoch ,callback){
    responseData.find({epochid: epoch} ,callback);
}

//get one by trialid response
module.exports.getresponseDataByTrialId= function(trial ,callback){
    responseData.find({trialid:trial} ,callback);
}

//add response
module.exports.addresponseData = function(response , callback){
    responseData.create(response ,callback);
}

