const Users = require('../models/user');
const bcrypt = require('bcryptjs');

exports.postLogin = (req, res, next) => {
    // TODO
    const email = req.body.email;
    const password = req.body.password;

    const user = Users.getUserByEmail(email); // model의 getuser함수로 email에 대응하는 유저 반환

    if (user) {
        // email에 대응하는 유저 존재
        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                    return res.redirect('/');
                }
                res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);
                return res.redirect('/login');
            });
    } else {
        // register 창 다시 만들시 이거 수정: 지금은 로그인창에 새로운 아이디 입력하면 자동으로 가입됨
        return res.redirect('/login');
    }
};
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    Users.getUserByEmail(email)
        .then((userDoc) => {
            if (userDoc) {
                // 해당 email을 가진 유저가 이미 존재
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    const user = new Users({
                        id: email,
                        password: hashedPassword,
                    });
                })
                .then((result) => {
                    res.redirect('/login');
                });
        })
        .catch((err) => {
            console.log(err);
        });
};
