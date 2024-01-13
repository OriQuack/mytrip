const path = require('path');
const dotenv = require('dotenv').config();

const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const app = express();

// const options = require('./config/key_config').options;
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(authRoutes);
app.use(planRoutes);

mongoConnect(() => {
    http.createServer(app).listen(process.env.HTTP_PORT); // http 서버
    // https.createServer(options, app).listen(process.env.HTTPS_PORT); // https 서버
});
