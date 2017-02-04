/**
 * Created by ed on 18/01/2017.
 */
"use strict";

let mongoose = require('mongoose');

let candidateAccountSchema = require('../../models/Accounts/candidateAccountSchema');
let conditionsSchema = require('../../models/Accounts/conditionsSchema');
let requestedCandidatesSchema = require('../../models/Validation/requestedCandidateSchema');
let questionSchema = require('../../models/Trials/questionSchema');
let eligibilitySchema = require('../../models/Trials/eligibilitySchema');
let researcherAccountsSchema = require('../../models/Accounts/researcherAccountSchema');
let researcherSchema = require('../../models/Trials/researcherSchema');
let responseSchema = require('../../models/Trials/responseSchema');
let trialSchema = require('../../models/Trials/trialSchema');
let verifiedCandidatesSchema = require('../../models/Validation/verifiedCandidateSchema');

module.exports = {
    candidateAccount: candidateAccountSchema,
    researcherAccount: researcherAccountsSchema,
    trialData: trialSchema,
    questionData: questionSchema,
    eligibilityData: eligibilitySchema,
    researcherData: researcherSchema,
    responseData: responseSchema,
    verifiedCandidatesData: verifiedCandidatesSchema,
    requestedCandidatesData: requestedCandidatesSchema
};