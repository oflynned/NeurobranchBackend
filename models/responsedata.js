var mongoose = require('mongoose');

var responsedataSchema = mongoose.Schema({
    trial_id: {
        type: String
    },
    epoch_id: {
        type: String
    },
    candidate_id: {
        type: String
    },
    responses: [{
        q_id: [{
            questiontype: {
                type: String
            },
            response: {
                type: String
            }
        }],
    }]

});

var responseData = module.exports = mongoose.model('responsedata', responsedataSchema, 'responsedata');

//Get trialdata
module.exports.getResponseData = function (callback, limit) {
    responseData.find(callback).limit(limit);
};

//Add trialdata
module.exports.addResponseData = function (resp, callback) {
    responseData.create(resp, callback);
};
