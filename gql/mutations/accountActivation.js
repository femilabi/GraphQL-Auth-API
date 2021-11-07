const { Op } = require("sequelize");
const {
    pickData,
} = require("../../utils/mainUtils");
const { sendEmailTemplate } = require("../../services/email/mailer");
const { models } = require("../../database/index");

module.exports = async function (parents, args) {
    let { email, hash, sms_code } = args;
    if (!email) {
        return {
            status: {
                type: "error",
                msg: "Email is required."
            }
        };
    }

    if (!(hash || sms_code)) {
        return {
            status: {
                type: "error",
                msg: "Activation code or link is required."
            }
        };
    }

    const user = await models.User.findOne({ where: { email } });
    if (user && user.active == 0) {
        const where = {
            user_id: user.id,
            [Op.or]: []
        };
        if (hash) where[Op.or].push({ hash });
        if (sms_code) where[Op.or].push({ sms_code });

        return models.ActivationHash
            .findOne({ where })
            .then(async function (activation_hash) {
                if (activation_hash && activation_hash.activated == 0) {
                    let activated = await user.activate().catch(console.trace);
                    if (activated) {
                        activation_hash.update({ activated }).catch(console.trace);
                        user.update({ final_activation_method: "email" }).catch(console.trace);

                        let replacements = pickData(user, ["email", "username", "firstname", "lastname"]);

                        // Send success email to user on his/her account activation
                        sendEmailTemplate(user.get("email"), "activated", {
                            replacements,
                        });

                        return {
                            status: {
                                type: "success",
                                msg: "Your account has been successfully activated! Proceed to login",
                                redirect: "/login"
                            }
                        };
                    } else {
                        return {
                            status: {
                                type: "error",
                                msg: "Activation failed. Please try again."
                            }
                        };
                    }
                } else {
                    return {
                        status: {
                            type: "info",
                            msg: "Account has already been activated! Please login to continue",
                            redirect: "/login"
                        }
                    };
                }
            })
            .catch(function (err) {
                console.trace(err);
                return {
                    status: {
                        type: "error",
                        msg: "Server side error occurred! Please try again later."
                    }
                };
            });
    } else {
        return {
            status: {
                type: "info",
                msg: "Account has already been activated! Please login to continue",
                redirect: "/login"
            }
        };
    }
};