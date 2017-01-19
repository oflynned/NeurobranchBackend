/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/create-requested-candidate', function (req, res) {
    Schemas.requestedCandidatesData.create(new Schemas.requestedCandidatesData(req.body));
    res.redirect('/');
});
app.get('/api/get-requested-candidates', function (req, res) {
    Schemas.requestedCandidatesData.getRequestedCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/trialid/:trialid', function (req, res) {
    Schemas.requestedCandidatesData.getRequestedCandidatesByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/candidate/:candidateid', function (req, res) {
    Schemas.requestedCandidatesData.getRequestedCandidatesByUserId(req.params.candidateid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-requested-candidates/listid/:_id', function (req, res) {
    Schemas.requestedCandidatesData.getRequestedCandidatesById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result.users);
    });
});
app.post('/api/remove-requested-candidate/trialid/:trialid/candidateid/:userid', function (req, res) {
    Schemas.requestedCandidatesData.removeRequestedCandidate(req.params.trialid, req.params.userid, function (err) {
        if (err) throw err;
        res.redirect('/users/trials/' + req.params.trialid);
    })
});

module.exports = app;