/**
 * Created by ed on 18/01/2017.
 */

let Schema = require("./mongoSchema");
let questionDataSchema = new Schema.schema({
        questions: [{
            question: String,
            questiontype: String,
            options: [{
                answer: String
            }],
            response: String
        }]
    },
    {
        collection: 'questiondata',
        safe: true
    }
);

let QuestionData = Schema.mongoose.model('QuestionData', questionDataSchema);

module.exports = {
    questionData: QuestionData
};