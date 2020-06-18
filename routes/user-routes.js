var express = require('express');
var router = express.Router();
var User = require('../models/user');
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
            // res.json({
            //     error: err
            // })
            res.render('admin/submit-error', {
                title: 'Success',
                message: err

            });
        }

        // res.jsonp({
        //     "message": "User created successfully"
        // })
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
        console.log(user);
        res.render('user/update-profile', {
            title: 'Profile',
            user: user,
            req: req
        });
    })
});
router.get('/info/:username', function (req, res, next) {
    User.get({ username: req.params.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        console.log(user);
        res.render('user/profile', {
            title: 'Profile',
            user: user,
            req: req
        });
    })
});
// router.get('/', middleware.isAdmin, function (req, res, next) {
//     User.get({}, function (err, users) {
//         if (err) {
//             res.json({
//                 "error": err
//             })
//         }
//         res.json({
//             "users": users
//         })
//     })
// });

router.get('/rankings', function (req, res, next) {
  
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
               
                user.score = 0;
                user.solved.forEach(function (answer) {
                    user.score += answer.point;
                });
            });
          
            
            res.render('rankings/rankings', {
                title: 'Rankings',
                users: users,
                req: req
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