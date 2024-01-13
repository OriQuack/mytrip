const jwt = require('jsonwebtoken');
const express = require('express');

const router = express.Router();

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return res.status(403).json({ message: 'Authentication required' });
    }
    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const accessToken = jwt.sign(
            { userEmail: decoded.userEmail },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '30m',
            }
        );
        res.status(403)
            .header('Authorization', accessToken)
            .json({ message: 'Renewed expired access token' });
    } catch (error) {
        return res.status(403).send('Invalid refresh token.');
    }
});

module.exports = router;
