var express = require('express');
var middleware = require('../middleware/index');
var router = express.Router();

var User = require('../models/user');

// GET route for reading data
router.get('/', function (req, res, next) {

   res.render('home', {
      middleware: middleware,
      user: User,
      req: req
   });
});

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

module.exports = router;