const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { reset } = require('nodemon');
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email).then((user) => {
        if (!user) {
            // TODO: send "Invalid email or password" error
            return res.redirect('/login');
        }
        // email에 대응하는 유저 존재
        console.log("user found!");
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    console.log('password correct!');
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                }
                // TODO: send "Invalid email or password" error
                console.log('Invalid email or password');
                res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);
                return res.redirect('/login');
            });
    });
};
exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) {
        // TODO: Send "password does not match" error
        console.log('password does not match');
        return res.redirect('/signup');
    }
    User.getUserByEmail(email)
        .then((userDoc) => {
            if (userDoc) {
                // 해당 email을 가진 유저가 이미 존재
                // TODO: Send "user already exists" error
                console.log('user already exists');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User(username, email, hashedPassword);
                    return user.save();
                })
                .then((result) => {
                    console.log('signup complete!');
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};
exports.getReset = (req,res,next)=> {

}

exports.postReset = (req,res,next)=> {  //비밀번호 리셋시 , 토큰이 담긴 링크를 이메일로 전송, 디비의 유저콜렉션에 토큰 저장
    //---> 유저가 이메일로 받은 링크로 접속시, 그 링크에 있는 토큰과 디비에 저장해놨던 토큰을 비교해서 유저임을 검증
    //--->why?: 다른 유저가 대충 url떄려맞춰서 비번 마음대로 바꿀 수 있음.

    crypto.randomBytes(32, (err,buffer)=> {//create token
        if(err){
            console.log(err);
            
            res.redirect('/reset');
        }
        const token = buffer.toString('hex');  
       
        //found user by email and set token 
        User.getUserByEmail(req.body.email)
        .then(user=> {
            if(!user){
                req.flash('error','No account with the email');
                return res.redirect('/re set');
            }
            
            const resetUser = new User(user.username,user.email,user.password,token,Date.now()+3600000);
           
            console.log(resetUser);
           //TO DO:  기존 유저 삭제 해야댐
            return resetUser.save();
        })
        .then(result=> {
            //check
            //send email
             //TO DO:  이메일 전송 해야됨
            console.log('success!');
            return   User.getUserByEmail(req.body.eail);
        })
        .then(result => console.log(result)) 
        .catch(err=> {
            console.log(err);
        });
    });
};

exports.getNewPassword = (req,res,next)=> {
    const token= req.params.token;
    User.findOne({resetToken: token,resetTokenExpriation: {$gt: Data.now()}}) 
    .then(user=> {
        //get 
    })
    .catch(err=> {
        console.log(err);
    })
}

exports.postNewPassword = (req,res,next)=> {
    const id = req.body.id;
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken:password, 
        resetTokenExpriation:{$gt: Date.now()},
        _id:id
    })
    .then(user=> {
        resetUser = user;
        return bcrypt.hash(newPassword,12);
    })
    .then(hashedPassword=> {
        resetUser.password = hashedPassword;
        resetUser.resetToken=undefined;
        resetUser.resetTokenExpriation=undefined;
        return resetUser.save();
    })
    .then(result=> {
        res.redirect('/login');
    })
    .catch(err=> {
        console.log(err);
        res.redirect('/new-password');
    })
}