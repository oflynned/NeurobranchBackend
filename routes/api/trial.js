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

//TODO DUPLICATION ERROR EXISTS HERE
app.post('/api/create-trial', function (req, res) {
    let parameters = req.body;

    //TODO ISSUE OF TAGS SPLIT BY LETTER HERE
    let tags = parameters['trial_tags'];
    console.log(tags);
    let trialTags = [];
    for (let i = 0; i < tags.length; i++) {
        trialTags[i] = {tag: tags[i]}
    }

    //separate trial params
    let trialParams = {
        title: parameters['trial_title'],
        briefdescription: parameters['trial_briefdesc'],
        detaileddescription: parameters['trial_longdesc'],
        trialtype: parameters['trial_type'],
        institute: req.user['institute'],
        tags: trialTags,
        duration: parameters['trial_duration'],
        frequency: parameters['trial_frequency'],
        waiverform: parameters['trial_waiverform'],
        datecreated: Date.now(),
        datestarted: 0,
        dateended: 0,
        candidatequota: parameters['trial_quota'],
        state: "created",
        researcherid: req.user['id'],
        currentduration: 0,
        lastwindow: 0,
        has_eligibility: "false",
        min_pass_mark: 0
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

                //question parsing done

                let eligibilityDetails = {};
                for (let e_k in parameters) {
                    let e_result = e_k.includes("e-");
                    if (e_result) eligibilityDetails[e_k] = parameters[e_k];
                }

                console.log(eligibilityDetails);

                let e_indices = Object.keys(eligibilityDetails);
                console.log(e_indices);
                let e_maxIndex = 0;
                for (let e_index = 0; e_index < e_indices.length; e_index++) {
                    let e_currIndex = parseInt(e_indices[e_index].match(/\d+/));
                    if (e_currIndex > e_maxIndex) e_maxIndex = e_currIndex;
                }

                console.log(e_maxIndex + " is the maximum eligibility question index");

                if (e_maxIndex > 0) {
                    //modify the trial to set has_eligibility to true
                    for (let e_qIndex = 0; e_qIndex < e_maxIndex; e_qIndex++) {
                        let e_question = {};
                        let e_answers = [];
                        let e_thisIndex = e_qIndex + 1;
                        for (let att in eligibilityDetails) {
                            if (att === "e-q" + e_thisIndex + "_title") {
                                e_question["title"] = eligibilityDetails[att]
                            } else if (att === "e-q" + e_thisIndex + "_type") {
                                e_question["question_type"] = eligibilityDetails[att]
                            } else if (att === "e-q" + e_thisIndex + "_ans[]") {
                                for (let e_q = 0; e_q < att.length; e_q++) {
                                    let e_answer = eligibilityDetails[att][e_q];
                                    if (e_answer != undefined) e_answers[e_q] = {
                                        "answer": e_answer,
                                        "score": eligibilityDetails["e-q" + e_thisIndex + "_scores[]"][e_q]
                                    };
                                }
                            }
                        }
                        e_question['index'] = e_qIndex;
                        e_question['trialid'] = trial_id;
                        if (e_answers.length > 0) e_question['answers'] = e_answers;
                        Schemas.eligibilityData.createEligibility(new Schemas.eligibilityData(e_question));
                    }

                    Schemas.trialData.updatePassMark(trial_id, parseInt(eligibilityDetails['e-min_pass_mark']), function (err) {
                        if (err) throw err;
                        Schemas.trialData.updateEligibility(trial_id, 'true', function (err) {
                            if (err) throw err;
                        });
                    });
                }
            }
        });
    });
    res.redirect('/users/dashboard');
});

app.get('/api/get-trials', function (req, res) {
    Schemas.trialData.getTrials(function (err, result) {
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
app.get('/api/update-trials-service', function (req, res) {
    Schemas.trialData.getTrialsByState('active', function (err, trials) {
        if (err) throw err;
        for (let trial in trials) {
            let currentTrial = parseInt(trials[trial]['currentduration'] / (1000 * 60));
            let currentDay = parseInt((Date.now() + (1000 * 60)) / (1000 * 60));
            console.log(currentDay - currentTrial + " mins difference");

            //every 5 mins
            if (currentDay - currentTrial > 5) {
                Schemas.trialData.getTrialById(trials[trial]['id'], function (err, result) {
                    result.currentduration = Date.now();
                    let window = parseInt(result.lastwindow);
                    window += 1;
                    result.lastwindow = window;
                    console.log(result.lastwindow + " " + result.duration);

                    //check if window is now at end of trial duration
                    if (parseInt(result.lastwindow) > parseInt(result.duration)) {
                        result.state = "ended";
                        result.dateended = Date.now();
                    }

                    result.save();
                })
            }
        }
        res.redirect('/');
    });
});

module.exports = app;