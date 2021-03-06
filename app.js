var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var middkeware = require('./middleware/index');
var cookieParser = require('cookie-parser');
var config = require('./config.json');

mongoose.connect('mongodb+srv://16020973:16020973@uetcodejudge-an2qi.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// CONNECTION EVENTS
mongoose.connection.on("connected", function () {
  console.log("Mongoose connected");
});
mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection error: " + err);
});
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose disconnected");
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

autoIncrement.initialize(mongoose.connection);

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// serve static files from template
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');


//ROUTER
var adminRouter = require('./routes/admin-routers');
app.use('/admin', middkeware.isAdmin, adminRouter);

var userRouter = require('./routes/user-routes');
app.use('/user', userRouter);

var problemRouter = require('./routes/proplem-routers');
app.use('/problem', problemRouter);

var answerRouter = require('./routes/answer-router');
app.use('/answer', answerRouter);

var submitRouter = require('./routes/submit-routers');
app.use('/submit', middkeware.isLoggedIn, submitRouter);

var authRouter = require('./routes/auth-routes');
app.use('/', authRouter);

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

// Start the server
var port = config.dev.port;
app.listen(port, function () {
  console.log('Server listening on port ' + port);
});