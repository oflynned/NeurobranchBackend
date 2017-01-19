/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.get('/debug/create-trial/:researcherid', function (req, res) {
    let trialParams = {
        title: "title" + Date.now(),
        briefdescription: "briefdescription" + Date.now(),
        detaileddescription: "detaileddescription" + Date.now(),
        trialtype: "trialtype" + Date.now(),
        organisation: "organisation" + Date.now(),
        condition: "condition" + Date.now(),
        datecreated: "datecreated" + Date.now(),
        datepublished: "datepublished" + Date.now(),
        dateactive: "dateactive" + Date.now(),
        candidatequota: "candidatequota" + Date.now(),
        state: "state" + Date.now(),
        researcherid: req.params.researcherid
    };
    Schemas.trialData.createTrial(new Schemas.trialData(trialParams));
    res.redirect('/debug/get-trials');
});

app.get('/debug/trial-number', function (req, res) {
    Schemas.trialData.getTrials(function (err, trialdata) {
        if (err) throw err;
        res.json(trialdata.length + " records in collection");
    });
});

app.post('/debug/see-response', function (req) {
    console.log(req.body);
});

module.exports = app;