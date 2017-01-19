/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/verify_can/:id', function (req, res) {
    res.redirect('/users/trials/' + id);
});

app.post('/reject_can/:id', function (req, res) {
    let id = req.body.userid;
    Schemas.requestedCandidatesData.removeRequestedCandidate(req.params.userid, function (err, rej) {
        if (err) throw err;

    });
    res.redirect('/users/trials/' + id);
});

//researchers ownership of trial meta data, ie who is hosting the trial
app.get('/api/subscribe-user/trialid/:trialid/candidateid/:id', function (req, res) {
    Schemas.candidateAccount.subscribeCandidate(req.params.id, req.params.trialid, function (err) {
        if (err) throw err;
        res.redirect('/users/trials/' + req.params.trialid);
    });
});

module.exports = app;