const Users = require('../models/user');
exports.postLogin = (req, res, next) => {  // TODO
    const {id,password} = req.body;
    //db에 id이미 존재시 실패
    const user = Users.GetUser(id);  //model의 getuser함수로 id에 대응하는 유저 반환
    if(user) {
        if (user.pasword===password)
        {
            //로그인 성공
        }
        else
            res.status(400).send('wrong password');
        
    }
    const newUser = {
        id,
        password,
    }
    //db에 저장
    res.cookie();
    res.redirect('/');
};