var mongoose = require('mongoose');

var questiondataSchema = mongoose.Schema({
    trial: {
        researchgroup: {
            type: String,
            required: true
        },
        questions: {
            question:{
                type:String
            },
            questiontype:{
                type:String
            },
            options:{
                answer:{
                    type:String
                },
                answer:{
                    type:String
                },
                answer:{
                    type:String
                },
                answer:{
                    type:String
                }
            },
            question:{
                type:String
            },
            questiontype:{
                type:String
            },

            question:{
                type:String
            },
            questiontype:{
                type:String
            },

            question:{
                type:String
            },
            questiontype:{
                type:String
            },


            question:{
                type:String
            },
            questiontype:{
                type:String
            },
            options:{
                answer:{
                    type:String
                },
                answer:{
                    type:String
                },
                answer:{
                    type:String
                },
                answer:{
                    type:String
                }
            },

            question:{
                type:String
            },
            questiontype:{
                type:String
            }
        }
    }
});

var questionData = module.exports = mongoose.model('questiondata', questiondataSchema, 'questiondata');

//Get trialdata
module.exports.getQuestionData = function (callback, limit) {
    questionData.find(callback).limit(limit);
};
