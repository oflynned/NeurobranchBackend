var mongoose = require('mongoose');

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
    response:{
        
        },

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

//get one response
module.exports.getresponseDataById= function(id ,callback){
    responseData.findById(id ,callback);
}

//add response
module.exports.addresponseData = function(response , callback){
    responseData.create(response ,callback);
}

