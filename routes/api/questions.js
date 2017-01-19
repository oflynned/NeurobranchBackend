/**
 * Created by ed on 19/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/create-question/:trialid', function (req, res) {
    let trialid = req.params.trialid;
    let questionParams = req.body;
    let questionDataParams = {
        trialid: trialid,
        questionParams
    };

    Schemas.questionData.createQuestion(new Schemas.questionData(questionDataParams));
    res.redirect('/api/get-questions');
});
app.get('/api/get-questions', function (req, res) {
    Schemas.questionData.getQuestions(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/questionid/:questionid', function (req, res) {
    Schemas.questionData.getQuestionById(req.params.questionid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/trialid/:trialid', function (req, res) {
    Schemas.questionData.getQuestionsByTrialId(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-questions/:trialid/:questionid', function (req, res) {
    Schemas.questionData.getQuestionByAllParams(req.params.questionid, req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

module.exports = app;