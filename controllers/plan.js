exports.getIndex = (req, res, next) => {
    // TODO
    res.send('<h1>Main</h1>'); // Connect to frontend
};

exports.getProtected = (req, res, next) => {
    // DUMMY
    res.send(`<h1>Protected accessed by ${req.user}<h1>`);
};
