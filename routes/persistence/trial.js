/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let userData = require("./userData");

function createItem(req) {
    return {
        trialname: req.body.trialname,
        trialid: req.body.trialid,
        description: req.body.description,
        trialtype: req.body.trialtype,
        researcher: {
            researchgroup: req.body.researchgroup,
            researchername: req.body.researchername
        },
        organisation: req.body.organisation,
        specialisation: req.body.specialisation,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        timeperiodfrequency: req.body.timeperiodfrequency,
        notificationfrequency: req.body.notificationfrequency,
        imageresource: req.body.imageresource,
        prerequisites: {
            minage: req.body.minage,
            condition: req.body.condition,
            prereqtype: req.body.prereqtype
        }
    };
}

function saveItem(req) {
    let item = createItem(req);
    let data = new userData.userData(item);
    data.save();
}

module.exports = {
    saveItem: saveItem
};