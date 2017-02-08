/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/set-trial-state/id/:id/state/:state', function (req, res) {
    Schemas.trialData.getTrialById(req.params.id, function (err, trial) {
        if (err) throw err;
        if (req.params.state == "created") {
            trial.state = "created";
            trial.datecreated = Date.now();
        } else if (req.params.state == "active") {
            trial.state = "active";
            trial.datestarted = Date.now();
            trial.currentduration = Date.now();
        } else if (req.params.state == "ended") {
            trial.state = "ended";
            trial.dateended = Date.now();
        }
        trial.save();
    });
    res.redirect('/users/trials/' + req.params.id);
});


app.post('/api/create-trial', function (req, res) {
    let parameters = req.body;

    //separate trial params
    let trialParams = {
        title: parameters['trial_title'],
        briefdescription: parameters['trial_briefdesc'],
        detaileddescription: parameters['trial_longdesc'],
        institute: req.user['institute'],
        duration: parameters['trial_duration'],
        frequency: parameters['trial_frequency'],
        waiverform: parameters['trial_waiverform'],
        datecreated: Date.now(),
        datestarted: 0,
        dateended: 0,
        state: "created",
        researcherid: req.user['id'],
        currentduration: 0,
        lastwindow: 0,
        has_eligibility: false
    };

    //trial parsing done
    Schemas.trialData.createTrial(new Schemas.trialData(trialParams), function () {
        Schemas.trialData.getLatestTrialByResearcher(req.user.id, function (err, latestTrial) {
            if (err) throw err;
            let trial_id = latestTrial._id;

            //scrub everything but questions
            let questionDetails = {};
            for (let k in parameters) {
                let result = k.includes("trial_") || k.includes("e-");
                if (!result) questionDetails[k] = parameters[k];
            }

            console.log(questionDetails);

            let indices = Object.keys(questionDetails);
            console.log(indices);
            let maxIndex = 0;
            for (let index = 0; index < indices.length; index++) {
                let currIndex = parseInt(indices[index].match(/\d+/));
                if (currIndex > maxIndex) maxIndex = currIndex;
            }

            console.log(maxIndex + " is the maximum question index");

            for (let qIndex = 0; qIndex < maxIndex; qIndex++) {
                let question = {};
                let answers = [];
                let thisIndex = qIndex + 1;
                for (let att in questionDetails) {
                    if (att === "q" + thisIndex + "_title") {
                        question["title"] = questionDetails[att]
                    } else if (att === "q" + thisIndex + "_type") {
                        question["question_type"] = questionDetails[att]
                    } else if (att === "q" + thisIndex + "_ans[]") {
                        for (let q = 0; q < att.length; q++) {
                            let answer = questionDetails[att][q];
                            if (answer != undefined) answers[q] = {"answer": answer};
                        }
                    }
                }
                question['index'] = qIndex;
                question['trialid'] = trial_id;
                if (answers.length > 0) question['answers'] = answers;

                Schemas.questionData.createQuestion(new Schemas.questionData(question));
            }
        });
    });
    res.redirect('/users/dashboard');
});

app.get('/api/get-trials', function (req, res) {
    Schemas.trialData.getAllTrials(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-trials/researcherid/:researcherid', function (req, res) {
    Schemas.trialData.getTrialsByResearcherId(req.params.researcherid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-trials/trialid/:trialid', function (req, res) {
    Schemas.trialData.getTrialById(req.params.trialid, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.post('/api/delete-trial/:trialid', function (req, res) {
    Schemas.trialData.deleteTrial(req.params.trialid, function () {
        Schemas.questionData.deleteQuestions(req.params.trialid, function () {
            Schemas.eligibilityData.deleteEligibilities(req.params.trialid, function () {
                res.redirect('/users/dashboard');
            });
        });
    });
});
module.exports = app;