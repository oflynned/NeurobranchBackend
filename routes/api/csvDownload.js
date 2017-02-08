/**
 * Created by alex on 03/02/2017.
 */
"use strict";

let Schemas = require("../persistence/schemas");
let express = require("express");
let json2csv = require('json2csv');
let fs = require('fs');
let path = require('path');
let mime = require('mime');

let app = express();

app.get('/users/download/:id', function (req, res) {
    Schemas.responseData.getResponseByTrialId(req.params.id, function (err, responses) {
        if (err) throw err;

        var trialId = req.params.id;
        var max = 0;

        for (var jsonObject in responses) {
            if (responses[jsonObject].response.length > max) {
                max = responses[jsonObject].response.length;
            }
        }

        var fields = ['candidateid', 'window', 'index', 'question_type', 'trialid'];
        for (var i = 0; i < max; i++) {
            fields.push('response[' + i + '].answer');
        }

        json2csv({
            data: responses,
            fields: fields
        }, function (err, csv) {
            fs.writeFile('testingScripts/' + trialId + '_neurobranch_' + '.csv', csv, function (err) {
                if (err) throw err;
                res.download('testingScripts/' + trialId + '_neurobranch_' + '.csv', trialId + '_neurobranch_' + '.csv');

                setTimeout(function () {
                    fs.unlink('testingScripts/' + trialId + '_neurobranch_' + '.csv', function (err) {
                        if (err) throw err;
                        console.log('file deleted successfully');
                    });
                }, 60000);
            });
        });
    });
});


module.exports = app;






