exports.NaverLogin = async (req, res, next) => {
    code = req.query.code; //프론트에서 code,state 받아야 됨
    state = req.query.state;
    const client_id = process.env.VITE_NAVER_CLIENTID;
    const client_secret = process.env.VITE_NAVER_SECRETKEY;
    api_url =
        'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' +
        client_id +
        '&client_secret=' +
        client_secret +
        '&redirect_uri=' +
        redirectURI +
        '&code=' +
        code +
        '&state=' +
        state;
    //api_url= `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${callbackUrl}&state=${secretKey}`;
    const response = await fetch(api_url, {
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret,
        },
    });
    const AccessToken = await response.json(); //토큰 받기

    const res = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const email = res.email;

    User.getUserByEmail(email)
        .then((user) => {
            const accessToken = generateToken.genAccessToken(user.username);
            const refreshToken = generateToken.genRefreshToken(user.username);
            if (!user) {
                //signup generate id,pass
                const username = generator.generate({
                    length: 8,
                    numbers: true,
                });
                const password = generater.generate({
                    length: 14,
                    numbers: true,
                    symbols: true,
                    strict: true,
                });
                bycrypt.hash(password, 12).then((hashedPassword) => {
                    const newUser = newUser(username, email, hashedPassword);
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
            } else {
                //login
                return res
                    .status(200)
                    .cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                    })
                    .header('Authorization', accessToken)
                    .json({ username: username });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Naver API Server error' });
        });
    //return res.send(tokenRequest);
};
