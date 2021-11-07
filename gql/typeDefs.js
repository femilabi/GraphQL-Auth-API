const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
module.exports = gql`
  type User {
    id: ID
    username: String
    email: String
    password: String
    firstname: String
    lastname: String
    active: Int
  }

  type FormError {
    field: String!
    msg: String!
  }

  type FormResponse {
    errors: [FormError]
  }

  type ResponseStatus {
    type: String!
    msg: String!
    redirect: String
  }

  type AuthData {
    auth_token: String
    current_user: User
  }

  type ActivationCodeHash {
    sms_code: String
    hash: String
  }

  union ResponseData = AuthData | ActivationCodeHash

  type CustomResponse {
    status: ResponseStatus!
    data: ResponseData
    errors: [FormError!]
  }

  type Query {
    getCurrentUser: CustomResponse!
  }

  type Mutation {
    register(email: String!, username: String!, password: String!): CustomResponse!
    login(email: String!, password: String!): CustomResponse!
    sendActivation(email: String!): CustomResponse!
    accountActivation(email: String!, sms_code: String, hash: String): CustomResponse!
    updateCurrentUser(firstname: String, lastname: String, password: String): CustomResponse!
  }
`;