const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const axios = require('axios');
const generator = require('generate-password');

const User = require('../models/user');
const generateToken = require('../util/generateToken');

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
            return res.status(404).json({ message: 'User not found!' });
        }
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    const accessToken = generateToken.genAccessToken(email);
                    const refreshToken = generateToken.genRefreshToken();
                    return res
                        .status(200)
                        .cookie('refreshToken', refreshToken, {
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

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User(username, email, hashedPassword);
            return user.save();
        })
        .then((result) => {
            const accessToken = generateToken.genAccessToken(email);
            const refreshToken = generateToken.genRefreshToken();
            return res
                .status(201)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                })
                .header('Authorization', accessToken)
                .json({ username: username });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500);
        });
};

exports.getReset = (req, res, next) => {};

exports.postReset = (req, res, next) => {
    //비밀번호 리셋시 , 토큰이 담긴 링크를 이메일로 전송, 디비의 유저콜렉션에 토큰 저장
    //---> 유저가 이메일로 받은 링크로 접속시, 그 링크에 있는 토큰과 디비에 저장해놨던 토큰을 비교해서 유저임을 검증
    //--->why?: 다른 유저가 대충 url떄려맞춰서 비번 마음대로 바꿀 수 있음.
    crypto.randomBytes(32, (err, buffer) => {
        //create token
        if (err) {
            console.log(err);

            res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        //found user by email and set token
        User.getUserByEmail(req.body.email)
            .then((user) => {
                if (!user) {
                    req.flash('error', 'No account with the email');
                    return res.send({
                        isSend: false,
                    });
                }
                user.resetToken = token;
                user.resetTokenExpriation = Date.now() + 3600000;
                return user;
            })
            .then((user) => {
                User.updateUserToken(user._id, user.resetToken, user.resetTokenExpriation);
                console.log('update success!');
                return user;
            })
            .then((user) => {
                //check
                //send email
                transporter.sendMail({
                    to: user.email,
                    from: 'yongjuni30@gmail.com', //추후에 다른 이메일 주소 등록해서 바꿔야됨
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/auth/reset/${token}">link</a> to set a new password.</p>
                    `,
                });
                console.log('email send complete!');
                res.send({
                    isSend: true,
                });
            })
            .catch((err) => {
                console.log(err);
                res.send(400);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    console.log(token);
    User.getUserByToken({ resetToken: token })
        .then((user) => {
            //console.log(user);
            if (user) {
                console.log('token valid!');
                res.send({
                    //new-password page 전송하는데 userId,token을 담아서 보내야됨
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            } else {
                console.log('invalid access!');
                res.status(403);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
        });
};

exports.postNewPassword = (req, res, next) => {
    // 위에서 받은 token,userId로 유저 검사
    // const username = req.body.username;
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    resetUser = new User();

    User.getUserByToken({ resetToken: passwordToken })
        .then((user) => {
            if (user) return bcrypt.hash(newPassword, 12);
            else res.status(404);
        })
        .then((hashedPassword) => {
            User.updatePassword(req.body.userId, hashedPassword);
            res.status(200);
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/new-password');
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
            return res.status(500).json({ message: 'Internal Server Error' });
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
            return res.status(500).json({ message: 'Internal Server Error' });
        });
};

exports.deleteUserData = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        User.deleteUserByEmail(email).then((result) => {
                            if (result === 1) {
                                return res
                                    .status(200)
                                    .json({ message: 'User successfully deleted' });
                            }
                            return res
                                .status(404)
                                .json({ message: 'Error in deleting user: user not found' });
                        });
                    } else {
                        return res.status(401).json({ message: 'Incorrect password' });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(400).json({ message: 'Bad request' });
                });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Internal Server Error' });
        });
};

exports.postGoogleLogin = (req, res) => {
    const code = req.body.code;
    axios
        .post('<https://oauth2.googleapis.com/token>', {
            client_id: env.process.GOOGLE_CLIENTID,
            client_secret: env.process.GOOGLE_SECRETKEY,
            code,
            redirect_uri: env.process.GOOGLE_REDIRECTURI,
            grant_type: 'authorization_code',
        })
        .then((google_token) => {
            axios
                .get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
                    headers: { Authorization: `Bearer ${google_token}` },
                })
                .then((userinfo) => {
                    const email = userinfo.email;
                    User.getUserByEmail(email).then((user) => {
                        const accessToken = generateToken.genAccessToken(email);
                        const refreshToken = generateToken.genRefreshToken();
                        if (!user) {
                            // 첫 SNS 로그인 -> signup
                            const username = generator.generate({
                                length: 8,
                                numbers: true,
                            });
                            const password = generator.generate({
                                length: 14,
                                numbers: true,
                                symbols: true,
                                strict: true,
                            });
                            bcrypt.hash(password, 12).then((hashedPassword) => {
                                const newUser = new User(username, email, hashedPassword);
                                newUser.save().then((result) => {
                                    return res
                                        .status(201)
                                        .cookie('refreshToken', refreshToken, {
                                            httpOnly: true,
                                        })
                                        .header('Authorization', accessToken)
                                        .json({ username: username });
                                });
                            });
                        }
                        // DB에 유저 존재 -> login
                        return res
                            .status(200)
                            .cookie('refreshToken', refreshToken, {
                                httpOnly: true,
                            })
                            .header('Authorization', accessToken)
                            .json({ username: user.username });
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
