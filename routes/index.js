var express = require('express');
var router = express.Router();
var assert = require('assert');
var multer = require('multer');
var upload = multer({dest: 'public/uploads/'});

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.createConnection('localhost:27017/neurobranch_db');

var trialData = require('../models/trialdata');
var Globals = require("./Globals.js");
//_id used to reference back trial, question relation to specify question schema relation
var userDataSchema = new Schema(
    {
        /*questionrelation:[{type:Schema.Types.ObjectId, ref:'QuestionData'}],*/
        /*_id:Number,*/
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
);
var UserData = mongoose.model('UserData', userDataSchema);
//creator used to reference scema that created the question
var questionDataSchema = new Schema(
    {
       /* trialrelation:{type:Number, ref:'UserData'},*/
        questions: [{
            question: String,
            questiontype: String,
            options: {
                answer: [String]
            }

        }]
    },
    {
        collection: 'questiondata',
        safe: true
    }
);
var QuestionData = mongoose.model('QuestionData', questionDataSchema);

var responseDataSchema = new Schema(
    {
        trialid: String,
        epochid: String,
        candidateid: String,
        responses: {
            qid: {
                questiontype: String,
                response: String
            }
        }
    },
    {
        collection: 'responsedata',
        safe: true
    }
);
var ResponseData = mongoose.model('ResponseData', responseDataSchema);

router.get('/', ensureAuthenticated, function (req, res) {
    UserData.find()
        .then(function (doc) {
            res.render('index',
                {
                    items: doc,
                    user: req.user,
                    active_main: "true"
                });
        });
});

//dashboard
router.get('/users/dashboard', function (req, res) {
    generateDashboard(res);
});

//display username in create_trial
router.get('/users/notifications', ensureAuthenticated, function (req, res) {
    res.render('notifications',
        {
            user: req.user,
            active_dash: "true"
        });
});

//display username in create_trial
router.get('/users/create_trial', ensureAuthenticated, function (req, res) {
    res.render('create_trial',
        {
            user: req.user,
            active_dash: "true"
        });
});

//display username in settings
router.get('/users/settings', ensureAuthenticated, function (req, res) {
    res.render('settings',
        {
            user: req.user,
            active_dash: "true"
        });
});

//help
router.get('/user/help', ensureAuthenticated, function (req, res) {
    res.render('help', {
        user: req.user,
        active_dash: "true"
    })
});

//load trial data
router.get('/get-data', function (req, res, next) {
    UserData.find()
        .then(function (doc) {
            res.render('create_trial',
                {
                    items: doc,
                    user: req.user
                });
        });
});

//Load question data
router.get('/get-data-q', function (req, res, next) {
    QuestionData.find()
        .then(function (docq) {
            res.render('create_trial', {
                items: docq,
                name: req.user.name,
                username: req.user.username
            });
        });
});

//insert for trials//
router.post('/insert',upload.any(), function (req, res, next){

    console.log(req.body);

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
//also acssociating the trial _id to the question
router.post('/insertq', function (req, res, next) {
    var itemq = {
        questions: {
            /*trialrelation:userDataSchema._id,*/
            question: req.body.question,
            questiontype: req.body.questiontype,
            options: {
                answer: req.body.answer
            }
        }
    /*   need to look over again   */
    };
    var qdata = new QuestionData(itemq);
    qdata.save();
    console.log(qdata);
    res.redirect('/users/dashboard');
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
/* querry for question relation  to trial
/*QuestionData.findOne({title: title}).populate('trialrelation').exec(function (err , qr ) {
    if(err)
        return __handleError(err);
    console.log("trial associated with question is  %s", qr.trialrelation.trialname);
});*/


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
        res.redirect('/');
    }
}

function generateTile(trialName, description, image, id, row) {
    return '<div class="col-md-4">' +
        '<div class="thumbnail">' +
        '<img src="' + image + '">' +
        '<div class="caption">' +
        '<h4>' + trialName + '</h4>' +
        '<p>' + description + '</p>' +
        '</div>' +
        '</div>' +
        '</div>'
}
function generateDashboard(res) {
    trialData.getTrialData(function (err, data) {
        var element = "";
        var rowId = 0;
        for (var i = 0; i < data.length; i++) {
            element += generateTile(data[i]['trialname'], data[i]['description'], 'http://placehold.it/500x250/EEE',
                data[i]['_id'], null); //row id final param
        }
        res.render('dashboard', {
            active_dash: "true",
            content: element
        });
    });
}

module.exports = router;