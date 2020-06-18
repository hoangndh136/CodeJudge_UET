var express = require('express');
var router = express.Router();
var Answer = require('../models/answer');
var User = require('../models/user');
var Problem = require('../models/problem');
var middleware = require('../middleware/index');
var config = require('../config.json');
var fs = require('fs-extra');
router.post('/create', middleware.isAdmin, function (req, res, next) {
    var answer = {
        title: req.body.title,
        statement: req.body.statement,
        serverInput: req.body.serverInput,
        serverOutput: req.body.serverOutput,
        sampleInput: req.body.sampleInput,
        sampleOutput: req.body.sampleOutput
    };

    Answer.create(answer, function (err, answer) {
        if (err) {
            res.json({
                error: err
            })
        }
        res.json({
            "message": 'Answer created successfully',
            'answer': answer
        })
    })
});

router.get('/recent', function (req, res, next) {
    Answer.find({})
        .sort({ 'timecreated': -1 })
        .limit(config.recent_answer)
        .exec(function (err, answers) {
            if (err) {
                res.json({
                    "error": err
                });
                return;
            }
            res.json({
                'answers': answers
            });
        });
});

router.get('/:id', function (req, res, next) {
    Answer
        .findOne({ _id: req.params.id })
        .populate('user')
        .populate('problem')
        .exec(function (err, answer) {
            if (err) {
                res.redirect('/');
            }

            res.render('answer/detail-answer', {
                title: 'Answer',
                req: req,
                answer: answer

            });
        })
});

router.get('/', function (req, res, next) {
    var skip = req.query.page ? (req.query.page - 1) * config.page_limit : 0;
    if (req.query.problem) {
        Problem.findOne({ title: req.query.problem }, function (err, problem) {
            if (err) {
                res.json({
                    "error": err
                })
                return;
            }

            if (!problem) {
                res.json({
                    "error": "Problem with title " + req.query.problem + " don't exist"
                })
                return;
            }

            Answer.find({ problem: problem._id })
                .populate('user')
                .populate('problem')
                .sort({ 'timecreated': -1 })
                .skip(skip)
                .limit(config.page_limit)
                .exec(
                    function (err, answers) {
                        if (err) {
                            res.json({
                                "error": err
                            })
                            return;
                        }
                        // res.json({
                        //     'answers': answers
                        // });
                        res.render('answer/list-answer', {
                            title: 'Answers',
                            req: req,
                            answers: answers

                        });
                    });
        });
        return;
    } else {

        Answer.find({})
            .populate('user').populate('problem')
            .sort({ 'timecreated': -1 })
            .skip(skip)
            .limit(config.page_limit)
            .exec(function (err, answers) {
                if (err) {
                    res.json({
                        "error": err
                    });
                    return;
                }
                // res.json({
                //     'answers': answers
                // });
                console.log(answers);
                res.render('answer/list-answer', {
                    title: 'Answers',
                    req: req,
                    answers: answers
                });
            });
    }
});

router.put('/update/:id', function (req, res, next) {

    var answer = {
        title: req.body.title,
        statement: req.body.statement,
        serverInput: req.body.serverInput,
        serverOutput: req.body.serverOutput,
        sampleInput: req.body.sampleInput,
        sampleOutput: req.body.sampleOutput
    };

    Answer.update({ _id: req.params.id }, answer, function (err, answer) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "message": 'Answer updated successfully'
        })
    })
});

router.delete('/remove/:id', function (req, res, next) {
    Answer.delete({ _id: req.params.id }, function (err, answer) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "message": 'Answer deleted successfully'
        })
    })
});

module.exports = router;