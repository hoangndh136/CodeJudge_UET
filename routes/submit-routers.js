var express = require('express');
var router = express.Router();
var child_process = require('child_process');
var fs = require('fs-extra');

var User = require('../models/user');
var Problem = require('../models/problem');
var Answer = require('../models/answer');
var config = require('../config.json');

var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store, {
    freeRetries: 50,
    lifetime: 3600
});

router.post('/', bruteforce.prevent, function (req, res) {

    var language = req.body.language;
    var code = req.body.code;
    User.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
            res.json({
                "error": err
            })
            return;
        }

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

            // for (var i = 0; i < 10; i++) {
            //     point += 10;
            //     result.push('Success');
            // }

            //fs.remove(folder, (err) => { });
            for (var i = 0; i < problem.serverInput.length; i++) {
                var inputFile = `${folder}/input.txt`;
                fs.writeFileSync(inputFile, problem.serverInput[i]);

                switch (language) {
                    case 'cpp':
                        var mainFile = `${folder}/main.cpp`;
                        fs.writeFileSync(mainFile, code);
                        var command = `docker run --rm -v ${folder}:${folder} glot/clang g++ ${mainFile} ${folder}/output ${folder}/input.txt`;
                        break;
                    case 'java':
                        var mainFile = `${folder}/Main.java`;
                        fs.writeFileSync(mainFile, code);
                        var command = `docker run --rm -v ${folder}:${folder} codejudgeuet_java javac ${mainFile} ${folder}/output ${folder}/input.txt`;
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

                var exce = child_process.execSync(command);
                var stdout = fs.readFileSync(`${folder}/output`, 'utf8');
                stdout = stdout.replace(/\n$/, '');

                if (stdout === problem.serverOutput[i]) {
                    point += problem.score/problem.serverOutput.length;
                    result.push('Success');
                } else {
                    result.push('Failure');
                }
                fs.remove(folder, (err) => { });

            }

            var newAnswer = {
                user: user._id,
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

                // res.json({
                //     result: answer.result,
                //     point: answer.point
                // });

                res.render('answer/detail-answer', {
                    title: 'Answer',
                    req: req,
                    answer: answer

                });
                problem.answers.addToSet(answer._id);

                var isExist = false;
                for (var i = 0; i < user.solved.length; i++) {
                    if (user.solved.problem === problem._id) {
                        user.solved.point = Math.max(user.solved.point, answer.point);
                        isExist = true;
                    }
                }
                if (!isExist) {
                    user.solved.addToSet(problem._id);
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