const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken && !refreshToken) {  // AT RT 모두 없음
        return res.status(403).json({ message: 'Authentication required' });
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {  // AT invalid
            if (!refreshToken) {  // AT invalid, RT가 없음
                return res.status(403).json({ message: 'Authentication required' });
            }
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                // AT invalid, RT valid -> AT 재발급
                const accessToken = jwt.sign(
                    { userEmail: decoded.userEmail },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' }
                );
                res.status(403)
                    .cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                    })
                    .header('Authorization', accessToken)
                    .json({ message: 'Renewed expired access token' });
            } catch (err) {  // AT invalid, RT invalid
                res.status(403).json({ message: 'Authentication required' });
            }
        } else {  // AT valid
            console.log(decoded);
            User.getUserByEmail(decoded.userEmail).then((user) => {
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
