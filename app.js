var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var db = require('./models/db'),
    project = require('./models/projects');

var routes = require('./routes/index'),
    projects = require('./routes/projects');

var app = express();

app.set('views', path.join(__dirname, 'views'));
//ako se promjeni ejs u jade onda ce se dobit cijela ista funkcionalnost samo u jade-u
app.set('view engine', 'ejs'); 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);
app.use('/projects', projects);

app.get('/home', function(req, res) {
	res.send('Hello Express');
});

var server = app.listen(3000, function() {
	console.log('3000');
})

module.exports = app;