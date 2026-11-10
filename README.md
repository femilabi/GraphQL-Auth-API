# GraphQL Authentication API

A Node.js API for account registration, email activation, login, and authenticated user queries. GraphQL is served through Apollo Server and Express, with MySQL persistence.

## Features

- Register an account and activate it with an email activation code or link
- Log in and receive a JWT bearer token
- Query the authenticated user's profile
- Update the current user's profile
- Send activation emails through a configured SMTP server

## Tech stack

- Node.js, Express, Apollo Server, and GraphQL
- MySQL with Sequelize
- bcrypt for password hashing
- JSON Web Tokens for authenticated requests
- Nodemailer and EJS email templates

## Requirements

- Node.js and npm
- MySQL
- OpenSSL to generate a local RSA private key
- SMTP credentials to send activation emails

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/femilabi/GraphQL-Auth-API.git
   cd GraphQL-Auth-API
   npm install
   ```

2. Create a MySQL database. The application synchronizes its Sequelize models when it starts; the database itself must already exist.

3. Create a local `config.js` in the repository root. This file is intentionally not tracked. It must export `app_name`, `home_dir`, `view_dir`, `db_conf`, and `mail_conf`, for example:

   ```js
   module.exports = {
     app_name: "GraphQL Authentication API",
     home_dir: "http://localhost:4000",
     view_dir: "http://localhost:4000/",
     db_conf: {
       name: "graphql_auth",
       username: "your-local-mysql-user",
       password: "your-local-mysql-password",
       host: "127.0.0.1",
       dialect: "mysql",
       port: 3306,
       prefix: ""
     },
     mail_conf: {
       smtp_host: "smtp.example.com",
       smtp_port: 587,
       smtp_secure: false,
       smtp_username: "your-smtp-user",
       smtp_password: "your-smtp-password",
       admin_email: "no-reply@example.com"
     }
   };
   ```

   Replace the example values with your local settings. Do not commit credentials.

4. Generate the RSA private key used to sign JWTs:

   ```bash
   openssl genrsa -out services/jsonwebtoken/jwt-private.key 2048
   ```

   Keep this key private and do not commit it.

5. Start the server:

   ```bash
   npm start
   ```

The GraphQL endpoint is `http://localhost:4000/graphql`.

## GraphQL operations

The schema defines the following operations:

| Operation | Purpose |
| --- | --- |
| `register(email, username, password)` | Create an account that must be activated |
| `sendActivation(email)` | Send an activation message |
| `accountActivation(email, sms_code, hash)` | Activate an account with an activation code or link hash |
| `login(email, password)` | Authenticate and return a JWT |
| `getCurrentUser` | Return the authenticated user's profile |
| `updateCurrentUser(firstname, lastname, password)` | Update the current user's profile |

For authenticated operations, send the token returned by `login` in the HTTP header:

```text
Authorization: Bearer <auth_token>
```

### Example login mutation

```graphql
mutation {
  login(email: "user@example.com", password: "your-password") {
    status {
      type
      msg
    }
    data {
      ... on AuthData {
        auth_token
        current_user {
          username
          email
          firstname
          lastname
        }
      }
    }
  }
}
```

## Project layout

- `gql/` — GraphQL schema, resolvers, queries, and mutations
- `middlewares/` — Request authentication
- `database/` — Sequelize setup and models
- `services/jsonwebtoken/` — JWT helpers and local signing key
- `services/email/` — SMTP mailer and activation templates
- `utils/mainUtils.js` — Configuration lookup and shared utilities

## Notes

- The application listens on port `4000`, configured in `index.js`.
- The `npm test` script currently starts the application; it is not an automated test suite.
- The repository includes an existing hosted endpoint at [graphql.femipeter.xyz/graphql](https://graphql.femipeter.xyz/graphql); availability and configuration may change.
