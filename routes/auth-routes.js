var express = require('express');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var middleware = require('../middleware/index');
var router = express.Router();
var mongoose = require('mongoose');
var config = require('../config.json');

var User = require('../models/user');
var Problem = require('../models/problem');
var Answer = require('../models/answer');

// GET route for reading data

router.get('/login', function (req, res) {
   res.render('login', {
      title: 'Login',
      userAuth: undefined
   });
})

router.post('/login', function (req, res) {
   User.findOne({ username: req.body.username }, function (err, user) {
      if (err) { return res.status(500).send('Error on the server.'); }
      if (!user) { return res.status(404).send('No user found.'); }

      user.comparePassword(req.body.password, function (err, result) {
         if (err) { return res.status(500).send('Error on the server.'); }

         if (!result) {
            return res.render('login', {
               title: 'Login',
               userAuth: false

            });
         }
         // create a token
         var token = user.generateJWT();

         res.cookie("cookieToken", token, { maxAge: 7 * 86400 * 1000 }); //expires after 7 day
         res.cookie("username", req.body.username);
         res.cookie("role", user.role);

         res.redirect('/');
      });
   });
});

router.get('/logout', function (req, res) {
   // res.status(200).send({ auth: false, token: null });
   res.clearCookie("cookieToken");
   // res.render('home', {
   //    middleware: middleware,
   //    user: User,
   //    req: req
   // });

   res.redirect('/login');
});

router.get('/register', function (req, res) {
   res.render('register', {
      title: 'Register'
   });
});

router.post('/register', function (req, res) {
   var user = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
   };

   User.create(user, function (err, newUser) {

      if (err) return res.status(500).send('There was a problem registering the user.');

      // create a token
      var token = newUser.generateJWT();

      // res.status(200).json({ auth: true, token: token });

      res.cookie("cookieToken", token, { maxAge: 900000 }); //expires after 900000 ms = 15 minutes
      res.cookie("username", req.body.username);
      res.redirect('/');
   });

});

router.get('/forgot', function (req, res) {
   res.render('forgotpassword', {
      title: 'Forgot password'
   });
});

router.post('/forgot', function (req, res) {


   var passwordLength = 8;
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for (var i = 0; i < passwordLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   bcrypt.hash(result, 10, function (err, hash) {
      if (err) {
         return next(err);
      }

  

      User.findOneAndUpdate({ username: req.body.username }, { password: hash }, function (err, user) {

         if (err) return res.status(500).send('Error');

         var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
               user: 'lamvanthu1234@gmail.com',
               pass: '12345678@Abc'
            }
         });
         console.log(user);
         var mailOptions = {
            from: 'CodeJudge',
            to: user.email,
            subject: 'New Password',
            text: result
         };

         transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
               console.log(error);
            } else {
               res.render('admin/submit-success', {
                  title: 'Success',
                  message: "If provided email is a registered email ID on Code Jugde, you will receive an email with your new password",
                  req: req
              });

               
            }
         });

      });
   });

});






router.get('/', function (req, res) {
   mongoose.connection.db.collection('identitycounters', function (err, collection) {
      if (err) {
         if (err) return res.status(500).send('There was a problem on server.');
      }
      collection.find({})
         .toArray(function (err, result) {
            var ranks = [];
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

                        for (var i = 0; i < config.page_limit; i++) {
                           var rank = {
                              _id: users[i]._id,
                              username: users[i].username,
                              score: users[i].score
                           }
                           ranks.push(rank)
                        }

                        Answer.find({})
                           .populate('user').populate('problem')
                           .sort({ 'timecreated': -1 })
                           .limit(config.page_limit)
                           .exec(function (err, answers) {
                              if (err) {
                                 res.json({
                                    "error": err
                                 });
                                 return;
                              }
                              console.log(answers);
                             
                              var correctNumber = 0;
                              var totalCorrect = 0;
                              var recentAnswers = [];
                              for (var i = 0; i < config.page_limit; i++) {
                                 var answer = {
                                    _id: answers[i]._id,
                                    user: answers[i].user._id,
                                    username: answers[i].user.username,
                                    problem: answers[i].problem._id,
                                    problemTitle: answers[i].problem.title,
                                    point: answers[i].point
                                 }
                                 recentAnswers.push(answer);
                                  correctNumber += answers[i].result.filter(x=>{return x.toLowerCase() ==='success';}).length;
                                  totalCorrect += answers[i].result.length;
                              }
                              var correctAnswerRate= Math.round(correctNumber/totalCorrect * 100 * 100)/100;
                              var correctAnswerRateInt = Math.round(correctNumber/totalCorrect * 100);
                             
                              res.render('home',{
                                 "middleware": middleware,
                                 //"user": User,
                                 "req": req,
                                 "numUser": result[2].count,
                                 "numProblem": result[0].count,
                                 "numAnswer": result[1].count,
                                 "ranks": ranks,
                                 "recentAnswers": recentAnswers,
                                 correctAnswerRate: correctAnswerRate,
                                 correctAnswerRateInt: correctAnswerRateInt
                              });
                           });
                     });
               });
         });
   });
});

module.exports = router;