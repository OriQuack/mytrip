const path = require('path');

const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
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

const httpServer = http.createServer(app); // http 서버
const httpsServer = https.createServer(options, app); // https 서버

httpServer.listen(3000);
httpsServer.listen(3001);
