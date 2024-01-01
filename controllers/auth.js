const Users = require('../models/user');
exports.postLogin = (req, res, next) => {  // TODO
    const {id,password} = req.body;
    //db에 id이미 존재시 실패
    const user = Users.GetUser(id);  //model의 getuser함수로 id에 대응하는 유저 반환
    if(user) {
        if (user.pasword===password)
        {
            //로그인 성공, 세션 부여
        }
        else
            res.status(400).send('wrong password');
        
    }
    else {  //register 창 다시 만들시 이거 수정: 지금은 로그인창에 새로운 아이디 입력하면 자동으로 가입됨
    const newUser = new Users(id,password);
    newUser.CreateUser()
    .then(result=> {
        console.log("new user registered!");
        res.cookie();
        res.redirect('/');
    })
    .catch(err=> {
        console.log(err);

    });
    };
    
};
