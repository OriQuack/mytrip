const path = require('path');

const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect;
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const store = new MongoDBStore({
    uri: 'mongodb+srv://admin:***REMOVED***@mytrip.e0j3pi1.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions',
});

const options = require('./config/key_config').options;

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(authRoutes);
app.use(planRoutes);

app.use(
    session({
        secret: '***REMOVED***',
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

mongoConnect(() => {
    http.createServer(app).listen(3000); // http 서버
    https.createServer(options, app).listen(3001); // https 서버
});
