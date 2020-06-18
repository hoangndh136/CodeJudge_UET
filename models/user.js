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
    }
});

UserSchema.plugin(autoIncrement.plugin, 'User');

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

UserSchema.statics = {
    create: function (data, cb) {
        var user = new this(data);
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
