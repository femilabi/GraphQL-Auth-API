const { models } = require("../database/index");
const { validateToken } = require("../services/jsonwebtoken/index");

module.exports = {
  checkAuth: async function (req, res, next) {
    let uid = null;
    if (req?.headers?.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      let token_data = validateToken(token);
      if (token_data) uid = token_data.id;
    }
    if (uid != null) req.User = await models.User.findByPk(uid);

    if (req?.User?.blocked) {
      res.json({
        status: {
          type: "error",
          msg: "Your account has been flagged!"
        },
        data: {
          blocked_memo: req.User.blocked_memo
        }
      });
    } else {
      req.isAuthenticated = req?.User?.id ? true : false;
      next();
    }
  },

  requireAuth: async function (req, res, next) {
    if (!(req.User && req.User instanceof models.User && req.isAuthenticated)) {
      // req.App.doCustom(function (req, res) {
      //   if (req.session) {
      //     req.session.lastURI = req.App.getCurrentURI();
      //     req.session.save();
      //   }
      // });
      res.json({
        status: {
          msg: "Authentication failed! Please login to continue request.",
          type: "error"
        },
        data: { auth: false }
      });
    } else {
      next();
    }
  },

  requirePermission: function (permission) {
    return async function (req, res, next) {
      var has_permission = await req.User.hasPermission(permission);
      if (has_permission) {
        next();
      } else {
        res.json({ status: { type: "error", msg: "Permission denied!" } })
      }
    };
  },
};
