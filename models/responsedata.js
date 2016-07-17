var mongoose = require('mongoose');

var responsedataSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    create_date:{
        type: Date,
        default:Date.now
    }

});
var responseData =module.exports= mongoose.model('responsedata', responsedataSchema, 'responsedata');

//get genres
module.exports.getresponseData= function(callback , limit){
    responseData.find(callback).limit(limit);
}

//add genre
module.exports.addresponseData = function(response , callback){
    responseData.create(response ,callback);
}