const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const typeDefs = require("./gql/typeDefs");
const resolvers = require("./gql/resolvers");
const context = require("./gql/context");
const { ApolloServer } = require('apollo-server-express');
const { checkAuth } = require("./middlewares/auth");

// Incoming data parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(checkAuth);

const server = new ApolloServer({
  typeDefs, resolvers, context
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();