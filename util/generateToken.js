const jwt = require('jsonwebtoken');

const genAccessToken = (email) => {
    const payload = { userEmail: email };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30m',
    });
};

const genRefreshToken = () => {
    return jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '3d',
    });
};

exports.genAccessToken = genAccessToken;
exports.genRefreshToken = genRefreshToken;
