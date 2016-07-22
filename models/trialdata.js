var mongoose = require('mongoose');


var trialdataSchema = mongoose.Schema({
        trialname: {
            type: String,
            required: true
        },
        trialid: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        trialtype: {
            type: String,
            required: true
        },
        researcher: {
            researchgroup: {
                type: String,
                required: true
            },
            researchername: {
                type: String,
                required: true
            }
        },
        organisation: {
            type: String,
            required: true
        },
        specialisation: {
            type: String,
            required: true
        },
        starttime: {
            type: String,
            required: true
        },
        endtime: {
            type: String,
            required: true
        },
        timerperiodfrequency: {
            type: String,
            required: true
        },
        notificationfrequency: {
            type: String,
            required: true
        },
        imageresource: {
            type: String,
            required: true
        },
        prerequisites: {
            minage: {
                type: String,
                required: true
            },
            condition: {
                type: String,
                required: true
            },
            prereqtype: {
                type: String,
                required: true
            }
        }

});

var trialData = module.exports = mongoose.model('trialdata', trialdataSchema, 'trialdata');
module.exports.getTrialData = function (callback, limit) {
    trialData.find(callback).limit(limit);
};

module.exports.getRandomTrial = function(limit, callback){
    trialData.find().skip(Math.floor(Math.random() * trialData.count())).limit(limit).exec(callback);
};
