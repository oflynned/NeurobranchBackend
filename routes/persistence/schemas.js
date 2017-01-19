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

//schemas
let candidateAccount = mongoose.model('CandidateAccounts', candidateAccountSchema);
let researcherAccount = mongoose.model('ResearcherAccounts', researcherAccountsSchema);

//base interactions
let trialData = mongoose.model('Trials', trialSchema);
let questionData = mongoose.model('Questions', questionSchema);
let eligibilityData = mongoose.model('Eligibility', eligibilitySchema);

//meta data about trials
let researcherData = mongoose.model('Researchers', researcherSchema);
let responseData = mongoose.model('Responses', responseSchema);

//verification to trial
let verifiedCandidatesData = mongoose.model('VerifiedCandidates', verifiedCandidatesSchema);
let requestedCandidatesData = mongoose.model('RequestedCandidates', requestedCandidatesSchema);

module.exports = {
    candidateAccount: candidateAccount,
    researcherAccount: researcherAccount,
    trialData: trialData,
    questionData: questionData,
    eligibilityData: eligibilityData,
    researcherData: researcherData,
    responseData: responseData,
    verifiedCandidatesData: verifiedCandidatesData,
    requestedCandidatesData: requestedCandidatesData
};