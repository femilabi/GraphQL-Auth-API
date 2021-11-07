const { getClientIp, pickData } = require("../../utils/mainUtils");
const { createToken } = require("../../services/jsonwebtoken");
const { models } = require("../../database/index");

module.exports = async function (parents, args, context, info) {
    let username_exists = await models.User.findByUsername(args.username);
    if (username_exists) {
        return {
            status: {
                type: "error",
                msg: "Username has been taken. Please choose a different username to continue."
            }
        };
    }

    let email_exists = await models.User.findByEmail(args.email);
    if (email_exists) {
        return {
            status: {
                type: "error",
                msg: "The email you provided has already been used by another user. Please choose a different email to continue. If you are the owner of the email try to login with the email or click the forgot password link to retrieve your account password."
            }
        };
    }

    // Generate unique referral ID for user
    let body = {
        ...pickData(args, ["email", "username", "password"]),
        active: 0,
        blocked: 0,
        role: "user",
        role_id: 1,
        activation_sent: 0,
        reg_ip: getClientIp(context.req)
    };

    return models.User
        .build(body)
        .save({
            fields: [
                "email",
                "username",
                "password",
                "role",
                "role_id",
                "reg_ip",
                "last_ip",
                "activation_sent",
                "blocked",
                "active",
                "reg_ip",
            ],
        })
        .then((user) => {
            if (user) {
                return {
                    status: {
                        msg: "Account registration is successful!",
                        type: "success",
                        redirect: `/account-activate?email=${user.email}`
                    },
                    data: {
                        variant_type: "AuthData",
                        current_user: pickData(
                            user,
                            ["username", "email", "firstname", "lastname"]
                        )
                    }
                };
            } else {
                return {
                    status: {
                        msg: "Request failed, server side issue detected. Try again.",
                        type: "error"
                    }
                };
            }
        })
        .catch(function (err) {
            console.trace(err);
            return {
                status: {
                    msg: "Server side error occurred, Please try again later.",
                    type: "error"
                }
            };
        });
};
