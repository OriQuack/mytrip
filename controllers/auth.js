const User = require('../models/user');
const generateToken = require('../util/generateToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

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
    console.log('postlogin');
    User.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(404).json({ messae: 'User not found!' });
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
            const user = new Users(username, email, hashedPassword);
            return user.save();
        })
        .then((result) => {
            const accessToken = generateToken.genAccessToken(email);
            const refreshToken = generateToken.genRefreshToken();
            return res
                .status(200)
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
    // 비밀번호 리셋시 , 토큰이 담긴 링크를 이메일로 전송, 디비의 유저콜렉션에 토큰 저장
    // ---> 유저가 이메일로 받은 링크로 접속시, 그 링크에 있는 토큰과 디비에 저장해놨던 토큰을 비교해서 유저임을 검증
    // --->why?: 다른 유저가 대충 url떄려맞춰서 비번 마음대로 바꿀 수 있음.

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
                    return res.status(404).json({ messae: 'User not found!' });
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
                // check
                // send email
                transporter.sendMail({
                    to: user.email,
                    from: 'yongjuni30@gmail.com', // 추후에 다른 이메일 주소 등록해서 바꿔야됨
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `,
                });
                console.log('email send complete!');
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.getUserByToken({ resetToken: token })
        .then((user) => {
            // console.log(user);
            if (user) {
                console.log('token valid!');
                res.status(200).json({
                    // new-password page 전송하는데 userId, token을 담아서 보내야됨
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            } else {
                console.log('invalid access!');
                res.status(401).json({
                    message: 'Invalid token',
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postNewPassword = (req, res, next) => {
    // 위에서 받은 token, userId로 유저 검사
    // const username = req.body.username;
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    resetUser = new User();

    User.getUserByToken({ resetToken: passwordToken })
        .then((user) => {
            if (user) return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            User.updatePassword(req.body.userId, hashedPassword);
            res.redirect('/login');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/new-password');
        });
};
