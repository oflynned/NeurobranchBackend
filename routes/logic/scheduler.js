/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let Schedule = require('node-schedule');
let TrialData = require("../../models/Trials/trialSchema");

const dailyUpdate = 1;
const weeklyUpdate = dailyUpdate * 7;
const fortnightlyUpdate = weeklyUpdate * 2;
const monthlyUpdate = weeklyUpdate * 4;

// every minute invoke cron job
const groomingRange = new Schedule.Range(0, 59, 1);
let rule = new Schedule.RecurrenceRule();
rule.hour = groomingRange;

function shouldUpdate(currentDay, lastTrialDay, frequency){
    return currentDay - lastTrialDay >= frequency;
}

// cron scheduler for automation of trial state grooming
function schedule() {
    Schedule.scheduleJob(rule, function () {
        console.log("Invoking scheduler, next update at " + new Date(Date.now() + (1000 * 60)));
        TrialData.getTrialsByState('active', function (err, trials) {
            if (err) throw err;

            if (trials.length == 0) {
                console.log("No trials to be updated");
            } else {
                for (var trial in trials) {
                    const MILLIS_TO_SECONDS = 1000;
                    const MILLIS_TO_MINUTES = MILLIS_TO_SECONDS * 60;
                    const MILLIS_TO_HOURS = MILLIS_TO_MINUTES * 60;
                    const MILLIS_TO_DAYS = MILLIS_TO_HOURS * 24;

                    var this_trial = trials[trial];
                    var lastTrialDay = parseInt(this_trial['currentduration'] / MILLIS_TO_DAYS);
                    var currentDay = parseInt((Date.now() / MILLIS_TO_DAYS));

                    console.log(currentDay - lastTrialDay);

                    var frequency = this_trial["frequency"];
                    var updateFrequency = -1;

                    console.log(frequency);

                    switch (frequency) {
                        case "Daily":
                            updateFrequency = dailyUpdate;
                            break;
                        case "Weekly":
                            updateFrequency = weeklyUpdate;
                            break;
                        case "Fortnightly":
                            updateFrequency = fortnightlyUpdate;
                            break;
                        case "Monthly":
                            updateFrequency = monthlyUpdate;
                            break;
                    }

                    if (shouldUpdate(currentDay, lastTrialDay, updateFrequency)) {
                        console.log(this_trial["title"] + " is being updated");
                        TrialData.getTrialById(this_trial['id'], function (err, result) {
                            result.currentduration = Date.now();
                            var window = parseInt(result.lastwindow);
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
