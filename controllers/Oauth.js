exports.NaverLogin = async (req,res,next) => {
    code = req.query.code;   //프론트에서 code,state 받아야 됨
    state= req.query.state;
    const client_id = process.env.Naver_ID;
    const client_secret = process.env.Naver_SECRET;
    api_url =  'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
    + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    
    const response = await fetch(api_url, {
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret,
        },
    });
    const tokenRequest = await response.json();   //토큰 받기

    return res.send(tokenRequest);
}
