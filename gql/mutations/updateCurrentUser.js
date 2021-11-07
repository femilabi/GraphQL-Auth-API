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

    const user_update = pickData(args, ["lastname", "firstname", "password"]);

    return req.User
        .update(user_update)
        .then((user) => {
            if (user) {
                return {
                    status: {
                        type: "success",
                        msg: "Record updated successfully!"
                    },
                    data: {
                        variant_type: "AuthData",
                        current_user: pickData(user, ["username", "email", "firstname", "lastname"])
                    }
                };
            } else {
                return {
                    status: {
                        type: "error",
                        msg: "Record update failed!"
                    }
                };
            }
        })
        .catch(function (err) {
            console.trace(err);
            return {
                status: {
                    type: "error",
                    msg: "Server side error occurred! Please try again later!"
                }
            };
        });
};
