const glob = require("glob");
const path = require("path");

const resolvers = {
    ResponseData: {
        __resolveType: (obj) => {
            return obj.variant_type;
        }
    },
    Query: {},
    Mutation: {},
};

glob.sync("./gql/queries/*.js").forEach(function (file) {
    resolvers.Query[path.parse(file)["name"]] = require(path.resolve(file));
});

glob.sync("./gql/mutations/*.js").forEach(function (file) {
    resolvers.Mutation[path.parse(file)["name"]] = require(path.resolve(file));
});

module.exports = resolvers;