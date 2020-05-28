var express = require('express');
var router = express.Router();
var Problem = require('../models/problem');
var Answer = require('../models/answer');
var middleware = require('../middleware/index');
var config = require('../config.json');

router.post('/create', middleware.isAdmin, function (req, res, next) {
    var problem = {
        title: req.body.title,
        statement: req.body.statement,
        serverInput: req.body.serverInput,
        serverOutput: req.body.serverOutput,
        sampleInput: req.body.sampleInput,
        sampleOutput: req.body.sampleOutput
    };

    Problem.create(problem, function (err, problem) {
        if (err) {
            res.json({
                error: err
            })
        }
        res.json({
            "message": "Problem created successfully",
            "problem": problem
        })
    })
});

router.get('/:title', function (req, res, next) {
    Problem.get({ title: req.params.title }, function (err, problem) {
        if (err) {
            res.redirect('/');
        }

        res.render('problem/problem', {
            title: 'Profile',
            req: req,
            problem: problem
        });
    })
});

router.put('/update/:id', function (req, res, next) {

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
            res.json({
                "error": err
            })
        }
        res.json({
            "message": "Problem updated successfully"
        })
    })
});

router.delete('/remove/:id', function (req, res, next) {
    Problem.delete({ _id: req.params.id }, function (err, problem) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "message": "Problem deleted successfully"
        })
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