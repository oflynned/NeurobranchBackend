/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.get('/api/get-eligibility', function (req, res) {
    Schemas.eligibilityData.getEligibility(function (err, result) {
        res.json(result);
    })
});
app.get('/api/get-eligibility/trialid/:trialid', function (req, res) {
    Schemas.eligibilityData.getEligibilityByTrial(req.params.trialid, function (err, result) {
        res.json(result);
    })
});

module.exports = app;