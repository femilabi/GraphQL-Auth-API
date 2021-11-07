const fs = require('fs');
const jwt = require('jsonwebtoken');

// use 'utf8' to get string instead of byte array  (512 bit key)
var privateKEY = fs.readFileSync(__dirname + '/jwt-private.key', 'utf8');
// var publicKEY  = fs.readFileSync(__dirname + '/jwt-public.key', 'utf8');

module.exports = {
    options: {
        expiresIn: "12h"
    },
    createToken: (data) => {
        try {
            let token = jwt.sign(data, privateKEY, { expiresIn: "12h" });
            return token;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    validateToken: (token) => {
        try {
            let result = jwt.verify(token, privateKEY, { expiresIn: "12h" });
            // let result = jwt.verify(token, publicKEY);
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    decodeToken: (token) => {
        try {
            let data = jwt.decode(token);
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
};