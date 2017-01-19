/**
 * Created by ed on 18/01/2017.
 */
"use strict";
let mongoose = require('mongoose');
let formulate = require('mongoose-formulate');
let Schema = mongoose.Schema;

mongoose.createConnection('localhost:27017/neurobranch_db');

module.exports = {
    schema: Schema,
    mongoose: mongoose
};