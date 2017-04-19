var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var db = require('./model/db'),
    project = require('./model/projects');

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

app.use('/', routes);
app.use('/projects', projects);

app.get('/home', function(req, res) {
	res.send('Hello Express');
});

var server = app.listen(3000, function() {
	console.log('3000');
})

module.exports = app;