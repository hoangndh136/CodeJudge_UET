var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var autoIncrement = require('mongoose-auto-increment');

var config = require('../config.json');
var secret = config.secret;
var salt = config.salt;

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: String,
    email: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "regular"],
        default: "regular"
    },
    solved: [{
        type: Number,
        ref: "Answer"
    }],
    answers: [{
        type: Number,
        ref: "Answer"
    }],
    group: {
        type: String,
        default: "None"
    },
    timecreated: {
        type: Date,
        default: Date.now
    },
    gender: {
        type: Number,
        default: "Unknow"
    },
    dateOfBirth: {
        type: String,
        default: "0"
    },
    street: {
        type: String,
        default: "Unknow"
    },
    city: {
        type: String,
        default: "Unknow"
    },
    postCode: {
        type: String,
        default: "Unknow"
    },
    country: {
        type: String,
        default: "Unknow"
    },
});

UserSchema.plugin(autoIncrement.plugin, 'User');

UserSchema.statics = {
    create: function (data, cb) {
        var user = new this(data);
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
        })
        user.save(cb);
    },

    get: function (query, cb) {
        this.find(query, cb);
    },

    getByName: function (query, cb) {
        this.find(query, cb);
    },

    update: function (query, updateData, cb) {
        this.findOneAndUpdate(query, { $set: updateData }, { new: true }, cb);
    },

    delete: function (query, cb) {
        this.findOneAndDelete(query, cb);
    }

}

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, result) {
        if (err) return cb(err);
        cb(null, result);
    });
}

UserSchema.methods.generateJWT = function () {
    return jwt.sign({
        id: this._id,
        username: this.username,
        role: this.role,
    }, secret, {
        expiresIn: 86400 * 7 // expires in 24 hours
    });
};

UserSchema.methods.toAuthJSON = function () {
    return {
        username: this.username,
        email: this.email,
        role: this.role,
        token: this.generateJWT()
    };
};

var User = mongoose.model('User', UserSchema);
module.exports = User;
