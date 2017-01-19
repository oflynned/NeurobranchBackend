/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Schedule = require('node-schedule');
let TrialData = require("../../models/Trials/trialSchema");

const updateFrequency = 1; // 1 min interval

// every minute invoke cron job
let rule = new Schedule.RecurrenceRule();
rule.minute = new Schedule.Range(0, 59, 1);

// cron scheduler for automation of trial state grooming
function schedule() {
    Schedule.scheduleJob(rule, function () {
        console.log("Invoking scheduler, next update at " + new Date(Date.now() + (1000 * 60)));
        TrialData.getTrialsByState('active', function (err, trials) {
            if (err) throw err;

            if (trials.length == 0) {
                console.log("No trials to be updated");
            } else {
                for (let trial in trials) {
                    let currentTrial = parseInt(trials[trial]['currentduration'] / (1000 * 60));
                    let currentDay = parseInt((Date.now() + (1000 * 60)) / (1000 * 60));

                    //update window per day
                    //1 min update
                    if (currentDay - currentTrial >= updateFrequency) {
                        TrialData.getTrialById(trials[trial]['id'], function (err, result) {
                            result.currentduration = Date.now();
                            let window = parseInt(result.lastwindow);
                            window += 1;
                            result.lastwindow = window;
                            console.log("Updating record (" + result.title + ")");

                            //check if window is now at end of trial duration
                            if (parseInt(result.lastwindow) >= parseInt(result.duration)) {
                                result.state = "ended";
                                result.dateended = Date.now();
                                console.log("Ending trial (" + result.title + ")");
                            }
                            result.save();
                        });
                    } else {
                        console.log("No update");
                    }
                }
            }
        })
    });
}

module.exports = {
    scheduleUpdate: schedule
};
