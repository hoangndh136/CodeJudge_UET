var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Problem = require('../models/problem');
var middleware = require('../middleware/index');
var config = require('../config.json');

router.post('/create', function (req, res, next) {
    var user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role == "on" ? "admin" : "regular"
    };

    User.create(user, function (err, user) {
        if (err) {
            res.render('admin/submit-error', {
                title: 'Success',
                message: err

            });
        }
        res.render('admin/submit-success', {
            title: 'Success',
            message: "Create new user success!",
            req: req
        });
    })
});

router.get('/update-user/:username', function (req, res, next) {
    User.get({ username: req.params.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }

        res.render('user/update-profile', {
            title: 'Profile',
            user: user,
            req: req
        });
    })
});

router.post('/update-user/:username', middleware.isLoggedIn, function (req, res, next) {
    if (req.body.username !== req.user.username) {
        res.json({
            "error": "can only update own profile"
        })
    }

    var params = {
        email: req.body.email,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        street: req.body.street,
        city: req.body.city,
        postCode: req.body.postCode,
        country: req.body.country
    }

    for (var prop in params) {
        if (!params[prop] || params[prop] === "") {
            delete params[prop];
        }
    }

    User.findOneAndUpdate({ username: req.params.username }, params, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }

        res.render('user/update-profile', {
            title: 'Profile',
            user: user,
            req: req
        });
    })
});

router.get('/info/:username', function (req, res, next) {
    User.findOne({ username: req.params.username })
        .populate('solved')
        .exec(function (err, user) {
            if (err) {
                res.json({
                    "error": err
                })
            }

            user.score = 0;
            user.solved.forEach(function (answer) {
                user.score += answer.point;
            });
            console.log(user);
            res.render('user/profile', {
                title: 'Profile',
                user: user,
                req: req
            });
        })
});

router.get('/rankings', function (req, res, next) {

    var skip = req.query.page ? (req.query.page - 1) * config.page_limit : 0;
    User.find({})
        .populate('solved')
        .exec(function (err, users) {
            if (err) {
                res.json({
                    "error": err
                })
                return;
            }

            Problem.find({})
                .exec(function (err, problems) {
                    if (err) {
                        res.json({
                            "error": err
                        })
                        return;
                    }

                    var total = 0;
                    problems.forEach(p => {
                        total += p.score;
                    })

                    users.forEach(function (user) {

                        user.score = 0;
                        user.solved.forEach(function (answer) {
                            user.score += answer.point;
                        });

                        user.percent = user.score * 100 / total;
                    });

                    users.sort(function (a, b) {
                        return b.score - a.score;
                    });

                    res.render('rankings/rankings', {
                        title: 'Rankings',
                        users: users.slice(skip, skip + config.page_limit),
                        req: req
                    });
                });
        });
});


router.put('/update/:id', middleware.isLoggedIn, function (req, res, next) {
    var user = {
        username: req.body.username,
        password: req.body.password
    }
    User.update({ _id: req.params.id }, user, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "message": "User updated successfully"
        })
    })
});

router.post('/remove/:id', middleware.isAdmin, function (req, res, next) {
    User.delete({ _id: req.params.id }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        // res.json({
        //     "message": "User deleted successfully"
        // })
        res.render('admin/submit-success', {
            title: 'Success',
            message: "User deleted successfully!",
            req: req
        });
    })
});

module.exports = router;