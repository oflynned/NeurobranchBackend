/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/create-verified-candidate/trialid/:trialid/candidateid/:userid', function (req, res) {
    Schemas.requestedCandidatesData.removeRequestedCandidate(req.params.trialid, req.params.userid, function (err) {
        if (err) throw err;
        let candidateData = {
            trialid: req.params.trialid,
            userid: req.params.userid
        };

        Schemas.verifiedCandidatesData.create(new Schemas.verifiedCandidatesData(candidateData, function (err) {
            if (err) throw err;
        }));
        res.redirect('/api/subscribe-user/trialid/' + candidateData.trialid + '/candidateid/' + candidateData.userid);
    });
});
app.get('/api/get-verified-candidates', function (req, res) {
    Schemas.verifiedCandidatesData.getVerifiedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-verified-candidates/trialid/:trialid', function (req, res) {
    Schemas.verifiedCandidatesData.getVerifiedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-verified-candidates/listid/:_id', function (req, res) {
    Schemas.verifiedCandidatesData.getVerifiedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});


module.exports = app;