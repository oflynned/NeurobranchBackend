var mongoose = require('mongoose');

var responsedataSchema = mongoose.Schema({
    trial: {
        trial_id: {
            type: String,
            required: true
        },
        epoch_id: {
            type: String,
            required: true
        },
        candidate_id: {
            type: String,
            required: true
        },
        responses:[ {
            q_id:[{
                questiontype:{
                    type:String
                },
                response:{
                    type:String
                }
            }],
        }]
    }
});

var responseData = module.exports = mongoose.model('responsedata', responsedataSchema, 'responsedata');

//Get trialdata
module.exports.getQuestionData = function (callback, limit) {
    responseData.find(callback).limit(limit);
};
