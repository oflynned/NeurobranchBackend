/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Schemas = require("../persistence/schemas");
let express = require("express");
let app = express();

app.post('/api/create-candidate', function (req, res) {
    req.body["isverified"] = "false";
    Schemas.candidateAccount.createCandidate(new Schemas.candidateAccount(req.body));
    res.redirect('/');
});
app.get('/api/get-candidates', function (req, res) {
    Schemas.candidateAccount.getCandidates(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-candidates/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.get('/api/get-candidates/:email', function (req, res) {
    Schemas.candidateAccount.getCandidateByEmail(req.params.email, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});
app.post('/api/candidate-login', function (req, res) {
    Schemas.candidateAccount.getCandidateByEmail(req.body.email, function (error, result) {
        console.log(req.body);
        if (error) throw error;
        if (result != null) {
            Schemas.candidateAccount.comparePasswords(req.body.password, result.password, function (err, isMatch) {
                if (err) throw err;
                res.json({
                    isMatch: isMatch,
                    id: result.id
                });
            });
        }
    });
});
app.get('/api/verify-candidate/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, doc) {
        doc.isverified = "true";
        doc.save();
    });
    res.redirect('/users/verified');
});
app.get('/api/get-candidate-subscriptions/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        res.json(result.subscribed);
    })
});
app.get('/api/get-candidate-trials/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        let trials = result.subscribed.reduce(function (keys, element) {
            for (let key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        Schemas.trialData.getTrialsByList(trials, function (err, result) {
            res.json(result);
        })
    });
});
app.get('/api/get-candidate-trials/:id/state/:state', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        let trials = result.subscribed.reduce(function (keys, element) {
            for (let key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        Schemas.trialData.getTrialsByListState(trials, req.params.state, function (err, result) {
            res.json(result);
        })
    });
});
app.get('/api/get-candidate-my-trials/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        let trials = result.subscribed.reduce(function (keys, element) {
            for (let key in element)
                keys.push(element[key]);
            return keys;
        }, []);

        Schemas.trialData.getTrialsByListExcludingState(trials, "ended", function (err, result) {
            res.json(result);
        })
    });
});

app.get('/api/get-last-candidate-response/:trialid/:candidateid', function (req, res) {
    let candidateId = req.params.candidateid;
    let trialId = req.params.trialid;

    Schemas.responseData.getResponseMostRecentWindow(trialId, candidateId, function (err, response) {
        // push -1 as the last response window if none are found
        if(response.length == 0) res.json([{last_response_window: -1}]);
        // otherwise retrieve the inner array & object
        else res.json([{last_response_window: response[0]["window"]}]);
    })
});

app.get('/api/get-candidate-excluded-trials/:id', function (req, res) {
    Schemas.candidateAccount.getCandidateById(req.params.id, function (err, result) {
        //create trial list of already subscribed/verified to
        let trials = result.relationship_with.reduce(function (keys, element) {
            for (let key in element) {
                keys.push(element[key]);
            }
            return keys;
        }, []);

        // candidate hasn't joined any trials, show all created trials
        if (trials.length == 0) {
            Schemas.trialData.getJoinableTrials(function (err, trials) {
                res.json(trials);
            });
        } else {
            // else get all trials that the user hasn't joined AND is created
            // add candidate trials already requested to join but not verified
            Schemas.trialData.getTrialsByExcluded(trials, function (err, trials) {
                if (err) throw err;
                res.json(trials);
            });
        }
    });
});

app.get('/api/create-trial-relationship/candidateid/:candidateid/trialid/:trialid', function (req, res) {
    Schemas.candidateAccount.addTrialRelationship(req.params.candidateid, req.params.trialid, function (err) {
        if (err) throw err;
        res.redirect('/api/get-candidates');
    });
});

module.exports = app;