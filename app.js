if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRouter = require('./routers/users');
const campgroundRouter = require('./routers/campgrounds');
const reviewRouter = require('./routers/reviews');

const MongoStore = require('connect-mongo');

const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp';

mongoose.set('strictQuery', true);

main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect(dbURL);
        console.log("Database connected")
    } catch (err) {
        console.log("Connection error")
        console.log(err)
    }
}

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisisnotagoodsecretname';

const store = new MongoStore({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false, // to erase the terminal warning
    saveUninitialized: true, // to erase the terminal warning
    cookie: { // create some basic cookie setup
        httpOnly: true, // a necessary secure setup
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // cookies to be expired in one week, e.g. if the user don't do any thing like clearing the browser's cookies, s/he will be logged out after one week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://stackpath.bootstrapcdn.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js',
    'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js',
    'https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.min.js',
    "https://kit.fontawesome.com/",
    "https://code.jquery.com/",
    "https://cdn.jsdelivr.net/npm/",
    "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js",
    "https://cdn.jsdelivr.net/",
  "https://cdnjs.cloudflare.com/ajax/libs/popper.js/",
  "https://stackpath.bootstrapcdn.com/bootstrap/",
];

const styleSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://stackpath.bootstrapcdn.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
    "https://cdn.jsdelivr.net/npm/",
    "https://cdn.jsdelivr.net/",
  "https://stackpath.bootstrapcdn.com/bootstrap/",
];

const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/',
    "https://res.cloudinary.com/",
];

const fontSrcUrls = [
    "https://use.fontawesome.com/",
    "https://fonts.gstatic.com/",
];

app.use(
    helmet({
        crossOriginEmbedderPolicy: ({ policy: "credentialless" }),
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkedwp4tl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            frameSrc: [
                "'self'",
                "https://www.mapbox.com/",
            ]
            }
        }
    })
)


// make sure these are after the app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
// store and unstore users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if(!['/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRouter);
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);


app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
}) // this will only run when none of the above routes match

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err. message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})


// process.env.PORT the actual port variable 
const port = 'https://yelp-camp-2023-4nip.onrender.com'
// const port = process.env.PORT || '8000';

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
