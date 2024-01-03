const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session =  require('express-session');
const app = express();

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(authRoutes);
app.use(planRoutes);

app.use(session({
    secret: '***REMOVED***',
    resave: false,
    saveUninitialized: false,
}))

app.listen(3000);

