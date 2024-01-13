exports.getIndex = (req, res, next) => {
    // TODO
    res.send('<h1>Main</h1>'); // Connect to frontend
};

exports.getProtectedExample = (req, res, next) => {
    // DUMMY
    res.send(`Protected route accessed by ${req.user.username}`);
};
