const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    console.log(authHeader);
    let decodedToken;

    if(!authHeader) {
        const error = new Error('Not authenticated!');
        error.statusCode = 401;
        throw error;
    }
    const token = req.get('Authorization').split(' ')[1];
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err){
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        const error = new Error('Not authenticated!');
        error.statusCode = 401;
        throw error;
    }

    console.log('DECODED TOKEN:')
    console.log(decodedToken)
    req.userId = decodedToken.userId;

    next();
};