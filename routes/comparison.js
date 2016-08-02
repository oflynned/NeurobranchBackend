var express = require('express');
var router = express.Router();
var assert = require('assert');

var mongoose = require('mongoose');
var formulate = require('mongoose-formulate');
var Schema = mongoose.Schema;

mongoose.createConnection('localhost:27017/neurobranch_db');

var userDataSchema = new Schema(
    {
        trialname: String,
        trialid: String,
        description: String,
        trialtype: String,
        researcher: [{
            researchgroup: String,
            researchername: String
        }],
        organisation: String,
        specialisation: String,
        starttime: String,
        endtime: String,
        timeperiodfrequency: String,
        notificationfrequency: String,
        imageresource: String,
        prerequisites: [{
            minage: String,
            condition: String,
            prereqtype: String
        }]
    },
    {
        collection: 'trialdata',
        safe: true
    }
);//overrides UserData collection

var UserData = mongoose.model('UserData', userDataSchema);

var questionDataSchema = new Schema(
    {
        questions: [{
            question: String,
            questiontype: String,
            options: [{
                answer: String
            }],
            response: String
        }]
    },
    {
        collection: 'questiondata',
        safe: true
    }
);

var QuestionData = mongoose.model('QuestionData', questionDataSchema);

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
    UserData.find()
        .then(function (doc) {
            res.render('index',
                {
                    items: doc,
                    name: req.user.name,
                    username: req.user.username,
                    trialname: req.body.trialname,
                    description: req.body.description
                });
        });
});

//display username in create_trial
router.get('/users/create_trial', ensureAuthenticated, function (req, res) {
    res.render('create_trial',
        {
            name: req.user.name,
            username: req.user.username
        });
});
//display username in settings
router.get('/users/settings', ensureAuthenticated, function (req, res) {
    res.render('settings',
        {
            name: req.user.name,
            username: req.user.username
        });
});

/*Load trial data*/
router.get('/get-data', function (req, res, next) {
    UserData.find()
        .then(function (doc) {
            res.render('create_trial',
                {
                    items: doc,
                    name: req.user.name,
                    username: req.user.username
                });
        });
});
/*Load question data*/
router.get('/get-data-q', function (req, res, next) {
    QuestionData.find()
        .then(function (docq) {
            res.render('create_trial', {items: docq, name: req.user.name, username: req.user.username});
        });
});

//insert for trials//
router.post('/insert', function (req, res, next) {
    var item = {
        trialname: req.body.trialname,
        trialid: req.body.trialid,
        description: req.body.description,
        trialtype: req.body.trialtype,
        researcher: {
            researchgroup: req.body.researchgroup,
            researchername: req.body.researchername
        },
        organisation: req.body.organisation,
        specialisation: req.body.specialisation,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        timeperiodfrequency: req.body.timeperiodfrequency,
        notificationfrequency: req.body.notificationfrequency,
        imageresource: req.body.imageresource,
        prerequisites: {
            minage: req.body.minage,
            condition: req.body.condition,
            prereqtype: req.body.prereqtype
        }
    };

    var data = new UserData(item);
    data.save();
    console.log(data);
    res.redirect('/users/create_trial');
});
//insert for questions////more than one question//
router.post('/insertq', function (req, res, next) {
    var itemq = {
        questions: {
            question: req.body.question,
            questiontype: req.body.questiontype,
            options: {
                answer: req.body.answer
            },
            response: req.body.response
        }

    };
    var qdata = new QuestionData(itemq);
    qdata.save();
    console.log(qdata);
    res.redirect('/users/create_trial');
});


///question update

router.post('/updateq', function (req, res, next) {

    var idq = req.body.idq;

    QuestionData.findById(idq, function (err, docq) {
        if (err) {
            console.error('error, no entry found');
            res.redirect('/');
        }
        docq.question = req.body.question;
        docq.questiontype = req.body.questiontype;
        docq.answer = req.body.answer;
        docq.save();
    });
    res.redirect('/');
});


router.post('/update', function (req, res, next) {

    var id = req.body.id;

    UserData.findById(id, function (err, doc) {
        if (err) {
            console.error('error, no entry found');
            res.redirect('/');
        }

        doc.trialname = req.body.trialname;
        doc.trialid = req.body.trialid;
        doc.description = req.body.description;
        doc.trialtype = req.body.trialtype;
        doc.researcher.researchergroup = req.body.researcher.researchergroup;
        doc.researcher.researchername = req.body.researcher.researchername;
        doc.organisation = req.body.organisation;
        doc.specialisation = req.body.specialisation;
        doc.starttime = req.body.starttime;
        doc.endtime = req.body.endtime;
        doc.timeperiodfrequency = req.body.timeperiodfrequency;
        doc.notificationfrequency = req.body.notificationfrequency;
        doc.imageresource = req.body.imageresource;
        doc.minage = req.body.minage;
        doc.condition = req.body.condition;
        doc.prereqtype = req.body.prereqtype;
        doc.save();

    });
    res.redirect('/');
});

router.post('/delete', function (req, res, next) {
    var id = req.body.id;
    UserData.findByIdAndRemove(id).exec();
    console.log("Removed---> ", id);
    res.redirect('/');
});

router.post('/deleteq', function (req, res, next) {
    var idq = req.body.idq;
    QuestionData.findByIdAndRemove(idq).exec();
    console.log("Removed---> ", idq);
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/index');
    }
}


module.exports = router;