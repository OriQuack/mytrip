const express = require('express');

const router = express.Router();

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: 'Access Denied. No refresh token provided.' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign(
            { userEmail: decoded.userEmail },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '15m',
            }
        );
        res.header('Authorization', accessToken).send(decoded.user);
    } catch (error) {
        return res.status(400).send('Invalid refresh token.');
    }
});

module.exports = router;
