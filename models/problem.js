var mongoose = require("mongoose");

var ProblemSchema = new mongoose.Schema({
    title:{
        type: String,
        unique: true,
        required: true,
    },
    statement: String,
    serverInput: [String],
    serverOutput: [String],
    sampleInput: String,
    sampleOutput: String,
    timecreated: {
        type: Date,
        default: Date.now
    }
});

ProblemSchema.statics = {
    create : function(data, cb) {
        var problem = new this(data);
        problem.save(cb);
    },

    get: function(query, cb) {
        this.find(query, cb);
    },

    getByName: function(query, cb) {
        this.find(query, cb);
    },

    update: function(query, updateData, cb) {
        this.findOneAndUpdate(query, {$set: updateData},{new: true}, cb);
    },

    delete: function(query, cb) {
        this.findOneAndDelete(query,cb);
    }
}

var Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;


