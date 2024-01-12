const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        User.getUserByEmail(decoded.userEmail).then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid toekn' });
    }
};

module.exports = { authenticate };