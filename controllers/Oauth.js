const axios = require('axios');
const User = require('../models/user');
const generator = require('generate-password');
const generateToken = require('../util/generateToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.NaverLogin = async (req, res, next) => {
  code = req.body.code; //프론트에서 code,state 받아야 됨
  state = req.body.state;
  const client_id = process.env.VITE_NAVER_CLIENTID;
  const client_secret = process.env.VITE_NAVER_SECRETKEY;
  const redirectURI = process.env.VITE_NAVER_CALLBACKURI;
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
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Naver-Client-Id': client_id,
      'X-Naver-Client-Secret': client_secret,
    },
  });
  const res_token = await response.json(); //토큰 받기
  console.log(res_token.access_token);
  console.log('got token!');

  const info = await axios.get('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${res_token.access_token}`,
    },
  });

  //   const email = info.email;
  const email = info.data.response.email;
  console.log(info.data.response.email);

  User.getUserByEmail(email)
    .then((user) => {
      //   const accessToken = generateToken.genAccessToken(user.username);
      //   const refreshToken = generateToken.genRefreshToken(user.username);
      if (!user) {
        //signup generate id,pass
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
        const accessToken = generateToken.genAccessToken(username);
        const refreshToken = generateToken.genRefreshToken();

        bcrypt.hash(password, 12).then((hashedPassword) => {
          const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
          });
          newUser.save().then((result) => {
            return res
              .status(201)
              .cookie('refreshToken', refreshToken, {
                expires: new Date(Date.now() + 259200),
                httpOnly: true,
              })
              .header('Authorization', accessToken)
              .json({ username: username });
          });
        });
      } else {
        const accessToken = generateToken.genAccessToken(user.username);
        const refreshToken = generateToken.genRefreshToken();
        //login
        return res
          .status(200)
          .cookie('refreshToken', refreshToken, {
            expires: new Date(Date.now() + 259200),
            httpOnly: true,
          })
          .header('Authorization', accessToken)
          .json({ username: user.username });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: 'Naver API Server error' });
    });
};
