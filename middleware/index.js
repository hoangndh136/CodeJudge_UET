var jwt = require('jsonwebtoken');
var config = require('../config.json');

var middleware = {};

middleware.isLoggedIn = function (req, res, next) {
    if (req.headers && req.cookies) {
        jwt.verify(req.cookies.cookieToken, config.secret, function (err, decode) {
            if (err) { req.user = undefined; }
            req.user = decode;
            next();
        });

    } else {
        res.redirect('login');
    }
}

middleware.isAdmin = function isAdmin(req, res, next) {
    if (req.headers && req.cookies) {
        jwt.verify(req.cookies.cookieToken, config.secret, function (err, decode) {
            if (err) {
                res.redirect('login');
            } else {
                if (decode.role !== 'admin') {
                    res.redirect('/');
                } else {
                    req.user = decode;
                    next();
                }
            }
        });
    } else {
        res.redirect('login');
    }
}

module.exports = middleware