var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var db = require('./models');

//instance of express application.
var app = express();

//set our application port
app.set('port', 80);

//set morgan to log info about our requests for development use.
app.use(morgan('dev'));

//initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

//initialize cookie-parser to allow access the cookies stored in the browser. 
app.use(cookieParser());

//initialize express-session to allow track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// check if user's cookie is still saved in browser and user is not set, then automatically log the user out
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


//middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};


//route for home page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


//route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


//start the express server and connect to db
app.listen(app.get('port'), function() {
  db.sequelize.sync();
});
