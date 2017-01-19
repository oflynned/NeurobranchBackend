/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Schema = require("./mongoSchema");
let userDataSchema = new Schema.schema({
        trialname: String,
        trialid: String,
        description: String,
        trialtype: String,
        researcher: [{
            researchgroup: String,
            researchername: String
        }],
        organisation: String,
        specialisation: String,
        starttime: String,
        endtime: String,
        timeperiodfrequency: String,
        notificationfrequency: String,
        imageresource: String,
        prerequisites: [{
            minage: String,
            condition: String,
            prereqtype: String
        }]
    },
    {
        collection: 'trialdata',
        safe: true
    }
);

let UserData = Schema.mongoose.model('UserData', userDataSchema);

module.exports = {
    userData: UserData
};