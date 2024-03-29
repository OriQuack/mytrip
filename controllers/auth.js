const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const axios = require('axios');
const generator = require('generate-password');

const User = require('../models/user');
const generateToken = require('../util/generateToken');
const encrypt = require('../util/encrypt');

//전송 생성 메서드 호출
const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: process.env.email_api_key,
        },
    })
);

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    const accessToken = generateToken.genAccessToken(user.username);
                    const refreshToken = generateToken.genRefreshToken();
                    return res
                        .status(200)
                        .cookie('refreshToken', refreshToken, {
                            expires: new Date(Date.now() + 259200000),
                            httpOnly: true,
                        })
                        .header('Authorization', accessToken)
                        .json({ username: user.username });
                }
                return res.status(401).json({ message: 'Incorrect password' });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({ message: 'Bad request' });
            });
    });
};

exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email)
        .then((user) => {
            if (user) {
                return res.status(409).json({ message: 'User already exists' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Interner server error' });
        });
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                username: username,
                email: email,
                password: hashedPassword,
            });
            return user.save();
        })
        .then((result) => {
            const accessToken = generateToken.genAccessToken(username);
            const refreshToken = generateToken.genRefreshToken();
            return res
                .status(201)
                .cookie('refreshToken', refreshToken, {
                    expires: new Date(Date.now() + 259200000),
                    httpOnly: true,
                })
                .header('Authorization', accessToken)
                .json({ username: username });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.postReset = (req, res, next) => {
    //비밀번호 리셋시 , 토큰이 담긴 링크를 이메일로 전송, 디비의 유저콜렉션에 토큰 저장
    //---> 유저가 이메일로 받은 링크로 접속시, 그 링크에 있는 토큰과 디비에 저장해놨던 토큰을 비교해서 유저임을 검증
    //--->why?: 다른 유저가 대충 url떄려맞춰서 비번 마음대로 바꿀 수 있음.
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        }
        const token = buffer.toString('hex');
        const resetTokenExpiration = Date.now() + 3600000;
        const encryptedToken = encrypt.encryptData(token, process.env.PASSWORD_TOKEN_SECRET);
        User.getUserByEmail(req.body.email)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        message: 'User not found',
                        isSend: false,
                    });
                }
                const updatingUser = new User(user);
                updatingUser
                    .updateUserToken(encryptedToken, resetTokenExpiration)
                    .then((result) => {
                        transporter.sendMail({
                            to: updatingUser.email,
                            from: 'yongjuni30@gmail.com', //추후에 다른 이메일 주소 등록해서 바꿔야됨
                            subject: 'Password reset',
                            html: `
                            <p>You requested a password reset</p>
                            <p>Click this <a href="http://localhost:5173/auth/new-password/${token}">link</a> to set a new password.</p>
                            `,
                        });
                        return res.status(200).json({
                            isSend: true,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(500)
                            .json({ message: 'Interner server error', isSend: false });
                    });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({ message: 'Bad request', isSend: false });
            });
    });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const token = req.body.passwordToken;
    const encryptedToken = encrypt.encryptData(token, process.env.PASSWORD_TOKEN_SECRET);

    User.getUserByToken({ resetToken: encryptedToken })
        .then((user) => {
            if (user) {
                const updatingUser = new User(user);
                bcrypt.hash(newPassword, 12).then((password) => {
                    updatingUser
                        .updatePassword(password)
                        .then((result) => {
                            return res.status(200).json({ message: 'Updated' });
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(500).json({ message: 'Interner server error' });
                        });
                });
            } else {
                return res.status(404).json({ message: 'Invalid token' });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(400).json({ message: 'Bad request' });
        });
};

exports.postVerifyUsername = (req, res, next) => {
    const username = req.body.username;
    User.getUserByUsername(username)
        .then((user) => {
            if (user) {
                return res.status(409).json({ message: 'Username already exists' });
            }
            return res.status(200).json({ message: 'Valid username' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.postVerifyEmail = (req, res, next) => {
    const email = req.body.email;
    User.getUserByEmail(email)
        .then((user) => {
            if (user) {
                return res.status(409).json({ message: 'Email already exists' });
            }
            return res.status(200).json({ message: 'Valid email' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.postUpdateUsername = (req, res, next) => {
    const username = req.body.username;
    req.user
        .updateUsername(username)
        .then((result) => {
            // renew access token with new username
            const accessToken = generateToken.genAccessToken(username);
            return res
                .status(200)
                .header('Authorization', accessToken)
                .json({ message: 'Username updated' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.deleteUserData = (req, res, next) => {
    req.user
        .deleteUser()
        .then((result) => {
            return res.status(200).json({ message: 'User successfully deleted' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Internal server error' });
        });
};

exports.postGoogleLogin = (req, res) => {
    const code = req.body.code;
    axios
        .post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENTID,
            client_secret: process.env.GOOGLE_SECRETKEY,
            code,
            redirect_uri: process.env.GOOGLE_REDIRECTURL,
            grant_type: 'authorization_code',
        })
        .then((result) => {
            const { access_token, id_token } = result.data;
            axios
                .get('https://www.googleapis.com/oauth2/v1/userinfo', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .then((userinfo) => {
                    const email = userinfo.data.email;
                    User.getUserByEmail(email).then((user) => {
                        if (!user) {
                            // 첫 SNS 로그인 -> signup
                            const username =
                                generator.generate({
                                    length: 8,
                                    numbers: true,
                                }) + '여행자';
                            const password = generator.generate({
                                length: 14,
                                numbers: true,
                                symbols: true,
                                strict: true,
                            });
                            bcrypt
                                .hash(password, 12)
                                .then((hashedPassword) => {
                                    const newUser = new User({
                                        username: username,
                                        email: email,
                                        password: hashedPassword,
                                        snsLogin: 'google',
                                    });
                                    newUser
                                        .save()
                                        .then((result) => {
                                            const accessToken =
                                                generateToken.genAccessToken(username);
                                            const refreshToken = generateToken.genRefreshToken();
                                            return res
                                                .status(201)
                                                .cookie('refreshToken', refreshToken, {
                                                    expires: new Date(Date.now() + 259200000),
                                                    httpOnly: true,
                                                })
                                                .header('Authorization', accessToken)
                                                .json({ username: username });
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            return res
                                                .status(500)
                                                .json({ message: 'Internal server error' });
                                        });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res
                                        .status(500)
                                        .json({ message: 'Internal server error' });
                                });
                        } else {
                            // DB에 유저 존재 -> login
                            const accessToken = generateToken.genAccessToken(user.username);
                            const refreshToken = generateToken.genRefreshToken();
                            return res
                                .status(200)
                                .cookie('refreshToken', refreshToken, {
                                    expires: new Date(Date.now() + 259200000),
                                    httpOnly: true,
                                })
                                .header('Authorization', accessToken)
                                .json({ username: user.username });
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: 'Google API server error' });
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Google API server error' });
        });
};

exports.postKakaoAuth = async (req, res, next) => {
    const authCode = req.query.code; //쿼리 스트링에서 인가 코드 추출
    //authCode를 사용하여 토큰 요청
    try {
        const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_REST_API_KEY,
                redirect_uri: process.env.KAKAO_REDIRECT_URL,
                code: authCode,
            },
        });

        const accessToken = tokenResponse.data.access_token;
        //console.log('token successfully received');
        //console.log(accessToken);

        //사용자 정보 받아오기
        const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        //console.log('User information successfully received');
        //console.log(userInfoResponse.data.id);

        const kakaoId = userInfoResponse.data.id;
        const email = userInfoResponse.data.kakao_account.email;
        User.getUserByKakaoId(kakaoId).then((user) => {
            if (!user) {
                //Signup
                //console.log('Kakao sign up');
                const username =
                    generator.generate({
                        length: 8,
                        numbers: true,
                    }) + '여행자';
                const password = generator.generate({
                    length: 14,
                    numbers: true,
                    symbols: true,
                    strict: true,
                });
                bcrypt
                    .hash(password, 12)
                    .then((hashedPassword) => {
                        const newUser = new User({
                            username: username,
                            email: email,
                            password: hashedPassword,
                            snsLogin: 'kakao',
                            kakaoId: kakaoId,
                        });
                        newUser
                            .save()
                            .then((result) => {
                                const accessToken = generateToken.genAccessToken(username);
                                const refreshToken = generateToken.genRefreshToken();
                                return res
                                    .status(201)
                                    .cookie('refreshToken', refreshToken, {
                                        expires: new Date(Date.now() + 259200000),
                                        httpOnly: true,
                                    })
                                    .header('Authorization', accessToken)
                                    .json({ username: username });
                            })
                            .catch((err) => {
                                console.log(err);
                                return res.status(500).json({ message: 'Internal server error' });
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(500).json({ message: 'Internal server error' });
                    });
            } else {
                //Login
                //console.log('kakao login');
                const accessToken = generateToken.genAccessToken(user.username);
                const refreshToken = generateToken.genRefreshToken();
                return res
                    .status(200)
                    .cookie('refreshToken', refreshToken, {
                        expires: new Date(Date.now() + 259200000),
                        httpOnly: true,
                    })
                    .header('Authorization', accessToken)
                    .json({ username: user.username });
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json(`Error retrieving token: ${error.message}`);
    }
};
