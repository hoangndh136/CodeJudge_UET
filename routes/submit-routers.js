var express = require('express');
var router = express.Router();
var child_process = require('child_process');
var fs = require('fs-extra');
const {
    performance
} = require('perf_hooks');
var User = require('../models/user');
var Problem = require('../models/problem');
var Answer = require('../models/answer');
var config = require('../config.json');

var ExpressBrute = require('express-brute');
var middleware = require('../middleware');
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store, {
    freeRetries: 50,
    lifetime: 3600
});

router.post('/', middleware.isLoggedIn, bruteforce.prevent, function (req, res) {

    var language = req.body.language;
    var code = req.body.code;
    Problem.findOne({ title: req.body.problem }, function (err, problem) {
        if (err) {
            res.json({
                "error": err
            })
            return;
        }

        var path = __dirname + '/';
        var folder = path + 'temp/' + random(10);
        fs.mkdirSync(folder);

        var result = [];
        var point = 0;

        var time = [];
        for (var i = 0; i < problem.serverInput.length; i++) {
            var inputFile = `${folder}/input.txt`;
            fs.writeFileSync(inputFile, problem.serverInput[i]);

            switch (language) {
                case 'ruby':
                    var mainFile = `${folder}/main.rb`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_ruby ruby ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'perl':
                    var mainFile = `${folder}/main.pl`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_perl perl ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'cpp':
                    var mainFile = `${folder}/main.cpp`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_cpp g++ ${folder} ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'java':
                    var mainFile = `${folder}/Main.java`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_javac javac ${mainFile} ${folder}/output ${folder}/input.txt`;
                    child_process.execSync(command);
                    var classFile = `${folder}`;
                    command = `docker run --rm -v ${folder}:${folder} codejudgeuet_java java ${classFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'javascript':
                    var mainFile = `${folder}/main.js`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_js node ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'php':
                    var mainFile = `${folder}/main.php`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_php php ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                case 'python':
                    var mainFile = `${folder}/main.py`;
                    fs.writeFileSync(mainFile, code);
                    var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_python python ${mainFile} ${folder}/output ${folder}/input.txt`;
                    break;
                default:
                    res.json({
                        stdout: "",
                        error: "language not support",
                    });
                    return;
            }

            var t0 = performance.now();

            var exce = child_process.execSync(command);
            var t1 = performance.now();
            time.push(t1 - t0);
            var stdout = fs.readFileSync(`${folder}/output`, 'utf8');
            stdout = stdout.replace(/\n$/, '');
            if (stdout === problem.serverOutput[i]) {
                point += problem.score / problem.serverOutput.length;
                result.push('Success');
            } else {
                result.push('Failure');
            }
            fs.remove(folder, (err) => { });
        }
        var newAnswer = {
            user: req.user.id,
            problem: problem._id,
            lang: language,
            sourceCode: code,
            result: result,
            point: point
        };
        Answer.create(newAnswer, function (err, answer) {
            if (err) {
                res.json({
                    error: err
                })
                return;
            }

            answer.populate('user').populate('problem').execPopulate().then(function (reFetchedDocument) {
                res.render('answer/detail-answer', {
                    title: 'Answer',
                    req: req,
                    answer: reFetchedDocument,
                    time: time
                });
            });

            problem.answers.addToSet(answer._id);
            problem.save();

            User.findOne({ _id: req.user.id })
                .populate('solved')
                .exec(function (err, user) {

                    var isExist = false;
                    user.solved.forEach(e => {
                        if (e.problem === problem._id) {
                            isExist = true;
                            if (e.point < answer.point) {
                                user.solved.pull(e._id);
                                user.solved.addToSet(answer._id);
                            }
                        }
                    });
                    if (!isExist) {
                        user.solved.addToSet(answer);
                    }

                    user.answers.addToSet(answer._id);
                    user.save();
                });
        });
    });
});

function random(size) {
    //returns a crypto-safe random
    return require('crypto').randomBytes(size).toString('hex');
}

module.exports = router;