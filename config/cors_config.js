const cors = require('cors');

// 특정 주소 접근 허용
exports.options = cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://mytripping.vercel.app',
    ],
});
