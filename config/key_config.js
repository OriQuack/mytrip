const fs = require('fs');
const path = require('path');

// 현재 스크립트의 디렉토리를 기반으로한 상대 경로
// const certPath = path.join(__dirname, 'config', 'secure', 'rootca', 'rootca.crt');
// const keyPath = path.join(__dirname,'config','secure','rootca','rootca.key');
module.exports.options = {
    // https 암호화 키 (dummy 키)
    key: fs.readFileSync('./config/secure/rootca.key'),
    cert: fs.readFileSync('./config/secure/rootca.crt'),
};
