const Plan = require('../models/plan');

exports.getIndex = (req, res, next) => {
    // TODO
    res.send('<h1>Main</h1>'); // Connect to frontend
};

exports.getProtected = (req, res, next) => {
    res.send(`This is ${req.user.username}`);
}