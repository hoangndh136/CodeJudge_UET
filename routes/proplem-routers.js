var express = require('express');
var router = express.Router();
var Problem = require('../models/problem');
var Answer = require('../models/answer');
var middleware = require('../middleware/index');
var config = require('../config.json');
const e = require('express');

router.post('/create', middleware.isAdmin, function (req, res, next) {

    Problem.findOne({ title: req.body.title }, function (err, result) {
        if (err) {
            res.render('admin/submit-error', {
                title: 'Error',
                message: err
            });
        }
        if (result) {
            res.render('admin/submit-error', {
                title: 'Error',
                message: err

            });
            return;
        }

        var newProblem = {
            title: req.body.title,
            statement: req.body.statement,
            sampleInput: req.body.sampleInput,
            sampleOutput: req.body.sampleOutput,
            score: req.body.score
        };

        Problem.create(newProblem, function (err, problem) {
            if (err) {
                // res.json({
                //     error: err
                // })
                res.render('admin/submit-error', {
                    title: 'Error',
                    message: err

                });
            }

            var input = req.body.serverInput.split(",");
            var output = req.body.serverOutput.split(",");
            if (input.size != output.size) {
                res.render('admin/submit-error', {
                    title: 'Error',
                    message: err

                });
                return;
            }

            input.forEach(e => {
                problem.serverInput.push(e);
            })
            output.forEach(e => {
                problem.serverOutput.push(e);
            })
            problem.save();

            res.render('admin/submit-success', {
                title: 'Success',
                message: "Create problem success!"

            });
        })
    });
});

// router.get('/:title', function (req, res, next) {
//     Problem
//         .findOne({ title: req.params.title })
//         .populate('answers')
//         .exec(function (err, problem) {
//             if (err) {
//                 res.redirect('/');
//             }
//            
//             res.render('problem/problem', {
//                 title: 'Profile',
//                 req: req,
//                 problem: problem
//             });
//         });
// });
router.get('/:_id', function (req, res, next) {


    Problem.findOne({ _id: req.params._id })
        .populate('answers')
        .exec(function (err, problem) {
            if (err) {
                res.redirect('/');
            }
            res.render('problem/problem', {
                title: 'Profile',
                req: req,
                problem: problem
            });
        });
});
router.post('/update/:id', function (req, res, next) {

    var problem = {
        title: req.body.title,
        statement: req.body.statement,
        serverInput: req.body.serverInput,
        serverOutput: req.body.serverOutput,
        sampleInput: req.body.sampleInput,
        sampleOutput: req.body.sampleOutput
    };

    Problem.update({ _id: req.params.id }, problem, function (err, problem) {
        if (err) {
            // res.json({
            //     "error": err
            // })
            res.render('admin/submit-error', {
                title: 'Error',
                message: err

            });
        }

        res.render('admin/submit-success', {
            title: 'Success',
            message: "Problem updated successfully"

        });
    })
});

router.post('/remove/:id', function (req, res, next) {
    Problem.delete({ _id: req.params.id }, function (err, problem) {
        if (err) {
            res.json({
                "error": err
            })
        }

        res.render('admin/submit-success', {
            title: 'Success',
            message: "Problem deleted successfully!"

        });
    })
});

router.get('/', function (req, res, next) {
    var skip = req.query.page ? (req.query.page - 1) * config.page_limit : 0;
    Problem.find({})
        .sort({ 'title': -1 })
        .skip(skip)
        .limit(config.page_limit)
        .exec(function (err, problems) {
            if (err) {
                res.json({
                    "error": err
                })
                return;
            }
            res.render('problem/list-problem', {
                title: 'Problems',
                req: req,
                problems: problems
            });
        });
});

module.exports = router;