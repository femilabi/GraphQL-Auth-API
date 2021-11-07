const { createToken } = require("../../services/jsonwebtoken");
const { pickData, getClientIp } = require("../../utils/mainUtils");
const { models } = require("../../database/index");

module.exports = async function (parents, args, context, info) {
    // Check if required fields is provided
    const { email, password } = args;
    if (!(email && password)) {
        return {
            status: {
                type: "error",
                msg: "Please supply your valid login credentials! (Username & Password)"
            }
        };
    }

    return models.User
        .login(email, password)
        .then(function (user) {
            // Check if username is found in the database
            if (!user) {
                return {
                    status: {
                        type: "error",
                        msg: "These credentials do not match our records!"
                    }
                };
            }

            // Check if user is activated or not
            if (!(user.active == 1)) {
                return {
                    status: {
                        type: "warning",
                        msg: "Your account needs activation!",
                        redirect: `/account-activation?email=${user.email}`
                    }
                };
            }

            // Update user last IP
            user.update({ last_ip: getClientIp(context.req) }).catch(console.trace);

            // Create jwt for user and return success response
            return {
                status: {
                    type: "success",
                    msg: "You have been successfully logged in!"
                },
                data: {
                    variant_type: "AuthData",
                    auth_token: createToken(pickData(user, ["id", "email"])),
                    current_user: pickData(user, ["username", "email", "firstname", "lastname"])
                }
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
