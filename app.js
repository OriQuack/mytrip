const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plan');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(authRoutes);
app.use(planRoutes);

app.listen(3000);
