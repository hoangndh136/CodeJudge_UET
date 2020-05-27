var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Problem = require('../models/problem');
var Answer = require('../models/answer');

var middleware = require('../middleware/index');



router.get('/:title', function (req, res, next) {
    Problem.get({ title: req.params.title }, function (err, problem) {
        if (err) {
            res.json({
                "error": err
            })
        }

        
        res.render('practice/practice', {
            title: 'Profile',
            req:req,
            problem:problem
         });
       
       
    })
});


module.exports = router;