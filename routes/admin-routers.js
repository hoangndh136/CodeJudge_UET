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
        .populate('solved')
        .exec(function (err, users) {
            if (err) {
                res.json({
                    "error": err
                })
                return;
            }
            users.forEach(function (user) {
                console.log(user)
                user.score = 0;
                user.solved.forEach(function (answer) {
                    user.score += answer.point;
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
            title: 'Create new user',
            users: users,
            req: req
        });
    })
});

router.get('/update-user/:username', function (req, res, next) {
    // User.get({}, function (err, users) {
    //     if (err) {
    //         res.json({
    //             "error": err
    //         })
    //     }
    //     res.render('admin/update-user', {
    //         title: 'List all user',
    //         users: users,
    //         req: req
    //     });
    // })

    User.get({ username: req.params.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        console.log(user);
        res.render('admin/update-user', {
            title: 'Update user',
            user: user,
            req: req
        });
    })
});


// router.get('/problem', function (req, res, next) {
//     Problem.get({}, function (err, problems) {
//         if (err) {
//             res.json({
//                 "error": err
//             })
//         }
//         res.render('admin/list-all-problem', {
//             title: 'Problems',
//             req: req,
//             problems: problems,
//         });
//     })
// });

router.get('/problem', function (req, res, next) {
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
            res.render('admin/list-all-problem', {
                title: 'Problems',
                req: req,
                problems: problems,
            });
        });
});



router.get('/create-new-problem', function (req, res, next) {
    User.get({}, function (err, users) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.render('admin/create-new-problem', {
            title: 'Create new problem',
            req: req
        });
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

router.get('/problem/:_id', function (req, res, next) {
   
    Problem.findOne({ _id: req.params._id })
        .populate('answers')
        .exec(function (err, problem) {
            if (err) {
                res.redirect('/');
            }
            
            res.render('admin/update-problem', {
                title: 'Update problem',
                req: req,
                problem: problem
            });
        });
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