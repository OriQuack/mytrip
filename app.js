const path = require('path');
const dotenv = require('dotenv').config();

const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const app = express();

// const httpsOptions = require('./config/key_config').options;
const corsOptions = require('./config/cors_config').options;
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use(authRoutes);
app.use(planRoutes);

mongoConnect(() => {
    http.createServer(app).listen(process.env.HTTP_PORT); // http 서버
    // https.createServer(httpsOptions, app).listen(process.env.HTTPS_PORT); // https 서버
});
