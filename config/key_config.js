const fs = require('fs');

module.exports.options = {
    // https 암호화 키 (dummy 키)
    key: fs.readFileSync('./config/secure/rootca.key'),
    cert: fs.readFileSync('./config/secure/rootca.crt'),
};