const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

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
                    const refreshToken = generateToken.genRefreshToken(email);
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
            const refreshToken = generateToken.genRefreshToken(email);
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

exports.getReset = (req, res, next) => { };

exports.postReset = (req, res, next) => {
    //비밀번호 리셋시 , 토큰이 담긴 링크를 이메일로 전송, 디비의 유저콜렉션에 토큰 저장
    //---> 유저가 이메일로 받은 링크로 접속시, 그 링크에 있는 토큰과 디비에 저장해놨던 토큰을 비교해서 유저임을 검증
    //--->why?: 다른 유저가 대충 url떄려맞춰서 비번 마음대로 바꿀 수 있음.
    crypto.randomBytes(32, (err, buffer) => {
        //create token
        if (err) {
            console.log(err);
            res.status(400).json({message:"error"});
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
                    <p>Click this <a href="http://localhost:5173/auth/reset/${token}">link</a> to set a new password.</p>
                    `,
                });
                
                res.send({
                    isSend: true,
                });
            })
            .catch((err) => {
                console.log(err);
                res.send(400).json({message:'Bad Request'});
            });
    });
};
/*
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
*/
exports.postNewPassword = (req,res,next)=> {  //위에서 받은 token,userId로 유저 검사
    //const username = req.body.username;
    var newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    var hashedPassword=String;
    
    User.getUserByToken({resetToken:passwordToken})
    .then(user=> {
        if(user)
        { 
            bcrypt.hash(newPassword,12).then(password=>{
                User.updatePassword(user._id,password);
                res.status(200).json({message: "success"});
            })
        }
        else
        {
                console.log('user not found!');
                res.status(404).json({message: 'Invalid token'});  //invalid token
        }
            
        
    })
    .catch(err=> {
        console.log(err);
        res.status(400).json({message: 'Bad Request'});
    })
}


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
                        User.deleteUserByEmail(email)
                            .then(result => {
                                if (result === 1) {
                                    return res.status(200).json({ message: 'User successfully deleted' });
                                }
                                return res.status(404).json({ message: 'Error in deleting user: user not found' });
                            })
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
