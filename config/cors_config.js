const cors = require('cors');

// 특정 주소 접근 허용
exports.options = cors({
    origin: [
        'https://mytripping.vercel.app/', //
        'http://localhost:5000',
    ],
});
