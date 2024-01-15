if (process.env.NODE_ENV !== 'production') {
    //process.env.NODE_ENV is an environment variable that is used to differentiate between production and development modes
    require('dotenv').config(); // this is going to take the variables defined in the ".env" file and add them to process.env in the node app
    // this is done so that we can access the variables in any of the files  
}
//console.log(process.env.SECRET);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const campgroundRoutes = require('./routes/campgrounds'); // to require router campgrounds
const reviewRoutes = require('./routes/reviews'); // to require router reviews
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Mongo Connection Open');
    })
    .catch(err => {
        console.log('Mongo Connection ERROR!');
        console.log(e);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // here I am telling express to include the public directory
app.use(mongoSanitize({
    replaceWith: '_'
}));

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // this is for extra security (the cookies are only accessible through http)
        // secure: true, // this is used so that the cookies are only accessible through a secure connection (https)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // this is in miliseconds (in this case is after a week)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false // I've set this to false because it wouldn't allow me to render images and some other content when set to true
}));

app.use(passport.initialize());
app.use(passport.session());
// here I am telling passport to use the local strategy and for that local strategy, 
// the authentication method is going to be located on our user model and called 'authenticate'.
passport.use(new LocalStrategy(User.authenticate()));

// this is basically telling how to (un)store a user in the session
passport.serializeUser(User.serializeUser()); // serialization refers to how do we store a user in a session
passport.deserializeUser(User.deserializeUser()); // how do we get the user out of the session

app.use((req, res, next) => {
    // res.locals is an object that provides a way to pass data through the application during the request-response cycle
    // It allows you to store variables that can be accessed by your templates and other middleware functions.
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'mwk@gmail.com', username: 'mwk' });
//     const newUser = await User.register(user, 'chicken'); // chicken is the password
//     res.send(newUser);
// });

app.use('/campgrounds', campgroundRoutes); // to use the campground routes
app.use('/campgrounds/:id/reviews', reviewRoutes); // to use the review routes
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

// this will only run if nothing else has matched first and we didn't respond for any of them
//app.all() is for every single request and '*' is for every path
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404)); //the next() will hand off the error to the default error handler below
});

// this is the error handler
app.use((err, req, res, next) => { // err is actually the error coming from a next() above
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh no! Something Went Wrong!';
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
});