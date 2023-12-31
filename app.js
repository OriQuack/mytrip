const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(authRoutes);

app.listen(3000);
