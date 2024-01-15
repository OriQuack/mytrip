const jwt = require('jsonwebtoken');

const User = require('../models/user');
const generateToken = require('../util/generateToken');

const authenticate = (req, res, next) => {
    const accessToken = req.headers['authorization'].split(' ')[1];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken && !refreshToken) {
        // AT RT 모두 없음
        return res.status(403).json({ message: 'Authentication required' });
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, accessDecoded) => {
        if (err) {
            // AT invalid or expired
            const accessExpired = jwt.decode(accessToken);
            if (!refreshToken || accessExpired === null) {
                // AT invalid or RT가 없음
                return res.status(403).json({ message: 'Authentication required' });
            }
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, refreshDecoded) => {
                if (err) {
                    // AT expired && RT invalid or expired
                    return res.status(403).json({ message: 'Authentication required' });
                } else {
                    // AT expired && RT valid -> AT 재발급
                    const newAccessToken = generateToken.genAccessToken(accessExpired.userEmail);
                    return res
                        .status(403)
                        .cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                        })
                        .header('Authorization', newAccessToken)
                        .json({ message: 'Renewed expired access token' });
                }
            });
        } else {
            // AT valid
            User.getUserByEmail(accessDecoded.userEmail).then((user) => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                req.user = user;
                next();
            });
        }
    });
};

module.exports = authenticate;
