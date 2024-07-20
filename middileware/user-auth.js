const jwt = require('jsonwebtoken');
const { GetSecureKey } = require('../util/config');
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        // const robustSecretKey = await GetSecureKey(); //generateRandomSecret();
        const robustSecretKey = 'this_is_secure_data_for_docmed_hari-om-namah-shivay';
        jwt.verify(token, robustSecretKey);
        next();
    } catch (error) {
        console.log(error)
        res.status(440).json({
            message: 'User Not Authorized'
        });
    }
};