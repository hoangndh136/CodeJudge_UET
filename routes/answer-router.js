var express = require('express');
var router = express.Router();
var Answer = require('../models/answer');
var User = require('../models/user');
var Problem = require('../models/problem');
var middleware = require('../middleware/index');
var config = require('../config.json');

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

router.get('/:id', function (req, res, next) {
    Answer.get({ _id: req.params.id }, function (err, answer) {
        if (err) {
            res.redirect('/');
        }

        User.findOne({ _id: answer.user }, function (err, user) {
            if (err) {
                res.redirect('/');
            }
    
            Problem.findOne({ title: req.body.problem }, function (err, problem) {
                if (err) {
                    res.json({
                        "error": err
                    })
                    return;
                }
    
                var path = __dirname + '/';
                var folder = path + 'temp/' + random(10);
                fs.mkdirSync(folder);
    
                var result = [];
                var point = 0;
    
                for(var i=0;i<10;i++){
                    point += 10;
                    result.push('Success');
                }
    
                fs.remove(folder, (err) => { });

                var answer = {
                    user: user._id,
                    problem: problem._id,
                    lang: language,
                    sourceCode: code,
                    result: result,
                    point: point
                };
                Answer.create(answer, function (err, answer) {
                    if (err) {
                        res.json({
                            error: err
                        })
                        return;
                    }
    
                    res.json({
                        result: answer.result,
                        point: answer.point
                    });
    
                    user.solved.addToSet(problem._id);
                    user.answers.addToSet(answer._id);
                    user.save();
                });
            });
        });

        res.json({
            'answer': answer
        })
    })
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

router.get('/', function (req, res, next) {
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

            //var skip = req.query.page ? (req.query.page - 1) * 5 : 0;

            Answer.find({ problem: problem._id })
                .sort({ 'timecreated': -1 })
                .limit(10)
                .exec(
                    function (err, answers) {
                        if (err) {
                            res.json({
                                "error": err
                            })
                            return;
                        }
                        res.json({
                            'answers': answers
                        });
                    });
        });
        return;
    }
    Answer.find({})
        .sort({ 'timecreated': -1 })
        .limit(10)
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

module.exports = router;