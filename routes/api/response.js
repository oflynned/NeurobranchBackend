/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/create-response/', function (req, res) {
    console.log(req.body);
    Schemas.responseData.createResponse(new Schemas.responseData(req.body));
    res.redirect('/api/get-responses');
});
app.get('/api/get-responses', function (req, res) {
    Schemas.responseData.getResponses(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/id/:_id', function (req, res) {
    Schemas.responseData.getResponseById(req.params._id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/questionid/:questionid', function (req, res) {
    Schemas.responseData.getResponseByQuestionId(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/trialid/:trialid', function (req, res) {
    Schemas.responseData.getResponseByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/:questionid/:candidateid', function (req, res) {
    Schemas.responseData.getResponseByQuestionIdCandidateId(req.params.questionid, req.params.candidateid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-responses/trialid/:trialid/candidateid/:candidateid', function (req, res) {
    Schemas.responseData.getResponseByTrialIdCandidateId(req.params.trialid, req.params.candidateid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-latest-window/trialid/:trialid/candidateid/:candidateid', function (req, res) {
    Schemas.responseData.getResponseMostRecentWindow(req.params.trialid, req.params.candidateid, function (err, result) {
        if (err) throw err;
        result = result == undefined ? [{window: -1}] : [{window: parseInt(result["window"])}];
        res.json(result);
    });
});

app.get('/api/delete-response/id/:id', function (req, res) {
    Schemas.responseData.deleteResponse(req.params.id, function (err) {
        if (err) throw err;
        res.redirect('/api/get-responses');
    });
});

module.exports = app;