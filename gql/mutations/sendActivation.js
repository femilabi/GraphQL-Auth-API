const {
    pickData,
    config,
    getCurrentTime,
} = require("../../utils/mainUtils");
const { sendEmailTemplate } = require("../../services/email/mailer");
const { models } = require("../../database/index");

module.exports = async function (parents, args) {
    const { email } = args;

    return models.User
        .findByEmail(email)
        .then(async (user) => {
            if (user && user.get("active") == 0) {
                if (
                    getCurrentTime() >=
                    Number(user.getMeta("last_activation_email_time")) + 60 * 15
                ) {
                    let activation_method = "email";
                    let hash = await user.getActivationHash();
                    if (!hash) hash = await models.ActivationHash.createNew(user.get("id"));

                    user
                        .update({
                            activation_sent: 1,
                            activation_method,
                        })
                        .catch(console.trace);

                    let replacements = {
                        ...pickData(user, ["firstname", "email", "username"]),
                        activation_link: config("view_dir") + "register/account-activate/" + hash.hash,
                        sms_code: hash.sms_code,
                    };
                    if (activation_method == "phone") {
                        //send sms here
                    } else {
                        sendEmailTemplate(user.get("email"), "activation", {
                            replacements,
                        });
                    }

                    // Update last email time
                    user.setMeta("last_activation_email_time", getCurrentTime());
                }

                return {
                    status: {
                        type: "success",
                        msg: "Your activation link has been sent! Please check your email box now including your spam folder. If you are still unable to get the activation email, please contact support."
                    }
                }
            } else {
                return {
                    status: {
                        type: "info",
                        msg: "Your account is active already! Please login to continue.",
                        redirect: "/dashboard"
                    }
                }
            }
        })
        .catch(function (err) {
            console.trace(err);
            return {
                status: {
                    type: "error",
                    msg: "Server side error occurred!"
                }
            }
        });
};