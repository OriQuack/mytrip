const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
        User.getUserByEmail(decoded.userEmail).then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            req.user = user;
            next();
        });
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).send('Authentication required.');
        }
        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            const accessToken = jwt.sign(
                { userEmail: decoded.userEmail },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
            }).header('Authorization', accessToken);
            next();
        } catch (err) {}
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticate };
