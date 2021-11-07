const { pickData } = require("../../utils/mainUtils");

module.exports = async function (parents, args, { req }) {
    // Check if user is already logged in
    if (!req.isAuthenticated) {
        return {
            status: {
                type: "error",
                msg: "Authentication is required! Please login to continue request"
            }
        };
    }

    return {
        status: {
            type: "success",
            msg: "success"
        },
        data: {
            variant_type: "AuthData",
            current_user: pickData(req.User, ["username", "email", "firstname", "lastname"])
        }
    };
};
