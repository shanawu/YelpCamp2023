const express = require('express');
const app = express();
const session = require('express-session');

const sessionOptions = { secret: 'thisisnotagoodsecretname', resave: false, saveUninitialized: false }
app.use(session(sessionOptions));

app.get('/', (req, res) => {
    if(req.session.count) {
        req.session.count += 1;
    } else {
        req.session.count = 1;
    }
    res.send(`You have viewed this page ${req.session.count} time(s)`)
})

app.get('/register', (req, res) => {
    const { username = 'Anonymous' } = req.query;
    req.session.username = username;
    res.redirect('/greet')
})

app.get('/greet', (req, res) => {
    const { username, count = 1 } = req.session;
    res.send(`Welcome back, ${ username }. You have visited the webpage for ${ count } time(s)`)
})

app.listen(3000, () => {
    console.log('PORT 300O FOR EXPRESS SESSION')
})