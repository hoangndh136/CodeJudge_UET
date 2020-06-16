var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Problem = require('../models/problem');
var Answer = require('../models/answer');
var middleware = require('../middleware/index');
var config = require('../config.json');

//router.use(middkeware.isAdmin);

router.get('/user', function (req, res, next) {
    User.get({}, function (err, users) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "users": users
        })
    })
});

router.get('/list-all-user', function (req, res, next) {
    var skip = req.query.page ? (req.query.page - 1) * config.page_limit : 0;
    User.find({})
        .sort({})
        .skip(skip)
        .limit(config.page_limit)
        .exec(function (err, users) {
            if (err) {
                res.json({
                    "error": err
                })
                return;
            }
            users.forEach(function (user) {
                user.score = 0;
                user.solved.forEach(function (problemID) {
                    element.score += Answer
                        .findOne({ user: user.username, problem: problemID })
                        .sort('point')
                        .exec(function (err, answerFound) {
                            if (!err) {
                                user.score += answerFound.point;
                            }
                        });
                });
            });
            res.render('admin/list-all-user', {
                title: 'List all user',
                users: users,
                req: req
            });
        });
});

router.get('/create-new-user', function (req, res, next) {
    User.get({}, function (err, users) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.render('admin/create-new-user', {
            title: 'List all user',
            users: users,
            req: req
        });
    })
});

router.get('/update-user', function (req, res, next) {
    User.get({}, function (err, users) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.render('admin/update-user', {
            title: 'List all user',
            users: users,
            req: req
        });
    })
});


router.get('/problem', function (req, res, next) {
    Problem.get({}, function (err, problems) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "problems": problems
        })
    })
});

router.get('/answer', function (req, res, next) {
    Answer.get({}, function (err, answers) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "answers": answers
        })
    })
});

router.get('user/:username', function (req, res, next) {
    User.get({ username: req.params.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "user": user
        })
    })
});

router.get('problem/:title', function (req, res, next) {
    Problem.get({ title: req.params.title }, function (err, problem) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "problem": problem
        })
    })
});

router.get('answer/:id', function (req, res, next) {
    Answer.get({ _id: req.params.id }, function (err, answer) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            'answer': answer
        })
    })
});

router.get('/', function (req, res, next) {
    
    
    
   
    User.get({ username: req.cookies.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
       
        res.render('admin/profile', {
            title: 'Profile',
            req: req,
            "user": user,
        });
    })
});

module.exports = router;