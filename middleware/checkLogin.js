const jwt = require('jsonwebtoken');

const User = require('../models/user');

const checkLogin = (req, res, next) => {
    // AT RT 확인해서 login 했으면 req.user에 유저를 저장
    // login 하지 않았으면 req.user는 undefined
    const accessToken = req.headers['authorization'].split(' ')[1];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken || !refreshToken) {
        // AT나 RT가 없음
        next();
    }
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        {
            complete: true,
            algorithms: ['HS256'],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false,
        },
        (err, refreshDecoded) => {
            if (err) {
                // RT invalid or expired
                next();
            }
            // RT valid
            jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    complete: true,
                    algorithms: ['HS256'],
                    clockTolerance: 0,
                    ignoreExpiration: true, // 보호해야 하는 route가 아니기 때문에 AT는 expiration 확인 안함
                    ignoreNotBefore: false,
                },
                (err, accessDecoded) => {
                    if (err) {
                        // AT invalid
                        next();
                    }
                    // AT valid
                    User.getUserByUsername(accessDecoded.payload.username).then((user) => {
                        if (!user) {
                            next();
                        }
                        req.user = new User(user);
                        next();
                    });
                }
            );
        }
    );
};

module.exports = checkLogin;
