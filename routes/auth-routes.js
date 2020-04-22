var express = require('express');
var router = express.Router();

var User = require('../models/user');

// GET route for reading data
router.get('/', function (req, res, next) {
   res.render('home');
});

router.get('/login', function (req, res) {
   res.render('login', {
      title: 'Login'
   });
})


router.post('/login', function (req, res) {
   User.findOne({ username: req.body.username }, function (err, user) {
      if (err) { return res.status(500).send('Error on the server.'); }
      if (!user) { return res.status(404).send('No user found.'); }

      user.comparePassword(req.body.password, function (err, result) {
         if (err) { return res.status(500).send('Error on the server.'); }

         if (!result) {
            return res.status(401).send({ auth: false, token: null });
         }
         // create a token
         var token = user.generateJWT();

         if (req.body.remember == true) {
            res.cookie("cookieToken", token, { maxAge: 900000 }); //expires after 900000 ms = 15 minutes
         }
         res.status(200)
            .json({
               auth: true,
               token: token
            });
      });
   });
});


router.get('/logout', function (req, res) {
   res.status(200).send({ auth: false, token: null });
});

router.get('/register', function (req, res) {
   res.render('register', {
      title: 'Register'
   });
});


router.post('/register', function (req, res) {
   var user = {
      username: req.body.username,
      password: req.body.password
   };

   User.create(user, function (err, newUser) {

      if (err) return res.status(500).send('There was a problem registering the user.');
      
      // create a token
      var token = newUser.generateJWT();

      res.status(200).json({ auth: true, token: token });
   });

});

module.exports = router;