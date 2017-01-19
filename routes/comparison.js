let express = require('express');
let router = express.Router();
let assert = require('assert');

let QuestionData = require("./persistence/questionData");
let UserData = require("./persistence/userData");
let Trial = require("./persistence/trial");

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
    UserData.userData.find()
        .then(function (doc) {
            res.render('index', {
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
    res.render('create_trial', {
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
router.get('/get-data', function (req, res) {
    UserData.find()
        .then(function (doc) {
            res.render('create_trial', {
                items: doc,
                name: req.user.name,
                username: req.user.username
            });
        });
});
/*Load question data*/
router.get('/get-data-q', function (req, res) {
    QuestionData.questionData.find()
        .then(function (docq) {
            res.render('create_trial', {
                items: docq,
                name: req.user.name,
                username: req.user.username
            });
        });
});

//insert for trials//
router.post('/insert', function (req, res) {
    Trial.saveItem(req);
    res.redirect('/users/create_trial');
});

//insert for questions////more than one question//
router.post('/insertq', function (req, res) {
    let itemq = {
        questions: {
            question: req.body.question,
            questiontype: req.body.questiontype,
            options: {
                answer: req.body.answer
            },
            response: req.body.response
        }

    };
    let qdata = new QuestionData(itemq);
    qdata.save();
    console.log(qdata);
    res.redirect('/users/create_trial');
});


///question update
router.post('/updateq', function (req, res) {
    let idq = req.body["idq"];
    QuestionData.questionData.findById(idq, function (err, docq) {
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

router.post('/update', function (req, res) {
    let id = req.body.id;
    UserData.userData.findById(id, function (err, doc) {
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

router.post('/delete', function (req, res) {
    let id = req.body.id;
    UserData.userData.findByIdAndRemove(id).exec();
    console.log("Removed---> ", id);
    res.redirect('/');
});

router.post('/deleteq', function (req, res) {
    let idq = req.body["idq"];
    QuestionData.questionData.findByIdAndRemove(idq).exec();
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/mainpage');
    }
}


module.exports = router;