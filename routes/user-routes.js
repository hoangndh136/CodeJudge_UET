var express = require('express');
var router = express.Router();
var User = require('../models/user');
var middleware = require('../middleware/index');

router.post('/create', function (req, res, next) {
    var user = {
        username: req.body.username,
        password: req.body.password
    };

    User.create(user, function (err, user) {
        if (err) {
            res.json({
                error: err
            })
        }
        
        res.jsonp({
            "message": "User created successfully"
        })
    })
});
router.get('/', function (req, res, next) {
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
router.get('/:username', function (req, res, next) {
    User.get({ username: req.params.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
   
        res.render('user/profile', {
            title: 'Profile',
            "user": user,
            req:req
         });
    })
});

router.put('/update/:id', function (req, res, next) {
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

router.delete('/remove/:id', function (req, res, next) {
    User.delete({ _id: req.params.id }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
        }
        res.json({
            "message": "User deleted successfully"
        })
    })
});


module.exports = router;