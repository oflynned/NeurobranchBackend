/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let Email = require("../services/email");
let DebugVariables = require("../logic/debugVariables");
let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/send', function (req) {
    Schemas.researcherAccount.createResearcher(new Schemas.researcherAccount(req.body), function (err, result) {
        if (err) throw err;
        if (DebugVariables.verifyEmail) {
            req.body["email"] = req.body.to;
            req.body["isverified"] = "false";
            Email.verifyEmail(req, result);
        }
    });
});

app.post('/api/create-researcher', function (req, res) {
    req.body["isverified"] = "false";
    Schemas.researcherAccount.createResearcher(new Schemas.researcherAccount(req.body));
    res.redirect("/users/login");
});

app.get('/api/verify-researcher/:id', function (req, res) {
    Schemas.researcherAccount.getResearcherById(req.params.id, function (err, doc) {
        doc.isverified = "true";
        doc.save();
    });
    res.redirect('/users/verified');
});

app.get('/api/get-researchers', function (req, res) {
    Schemas.researcherAccount.getResearcher(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/api/get-researchers/id/:id', function (req, res) {
    Schemas.researcherAccount.getResearcherById(req.params.id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/api/get-researchers/email/:email', function (req, res) {
    Schemas.researcherAccount.getResearcherByEmail(req.params.email, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/api/get-researchers/username/:username', function (req, res) {
    Schemas.researcherAccount.getResearcherByUsername(req.params.username, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.post('/api/create-researcher-data/:trialid', function (req, res) {
    let trialid = req.params.trialid;
    let researchers = req.body;
    let researcherDataParams = {
        trialid: trialid,
        researchers
    };
    Schemas.researcherData.createResearchers(new Schemas.researcherData(researcherDataParams));
    res.redirect('/api/get-researcher-data');
});
app.get('/api/get-researcher-data', function (req, res) {
    Schemas.researcherData.getResearchers(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-researcher-data/:trialid', function (req, res) {
    Schemas.researcherData.getResearchersById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.exclusions);
    });
});
app.get('/api/get-researcher-data/:_id', function (req, res) {
    Schemas.researcherData.getResearchersById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result.exclusions);
    });
});

module.exports = app;