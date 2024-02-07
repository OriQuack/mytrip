const fs = require('fs');
const path = require('path');

module.exports.options = {
    // https 암호화 키 (dummy 키)
    key: fs.readFileSync('/etc/letsencrypt/live/commitmytripplanner.shop/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/commitmytripplanner.shop/fullchain.pem'),
};
