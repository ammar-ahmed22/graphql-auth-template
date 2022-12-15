# GraphQL Authentication Template
I find myself having to create user authentication systems over and over again for various projects and hackathons.
So, I created this starter template that I can modify for any future projects easily. Basic authentication is set 
up with this GraphQL API for users to register, login, get user data, update user data and reset passwords. Users are 
persisted in MongoDB.

## Languages/Frameworks
- Node.js (server environment)
- TypeScript (language)
- GraphQL (API language)
- MongoDB (database)
- Apollo Server (serving GraphQL API)
- Express (serving GraphQL API)
- TypeGraphQL (structuring GraphQL with types)
- Typegoose (structuring MongoDB documents with types)
- Mongoose (connecting to MongoDB)
- dotenv (environment variables)
- brcryptjs (encryption)


## Environment Variables

To run this project, you will need to add the following environment variables to a `config.env` file in the root directory (not `src`).

`MONGO_URI` Your MongoDB uri (e.g. mongodb://127.0.0.1:27017/auth-template)

`JWT_SECRET` A private key for creating your json web token's. Can be any string value (e.g. helloworld). For a production application, it should be something hard to guess.

`JWT_EXPIRES_IN` The amount of time before a JWT expires (e.g. 1 year)

Your `config.env` file should look something like:
```env
MONGO_URI=mongodb://127.0.0.1:27017/auth-template
JWT_SECRET=helloworld
JWT_EXPIRES_IN="1 year"
```

## Run Locally
#### Clone the repository
```bash
git clone https://github.com/ammar-ahmed22/graphql-auth-template.git
```

#### Change directory
```bash
cd graphql-auth-template
```

#### Install dependenices
```bash
npm install # yarn install
```

#### Create `config.env` file
```bash
echo 'MONGO_URI=mongodb://127.0.0.1:27017/auth-template\nJWT_SECRET=helloworld\nJWT_EXPIRES_IN="1 year"' >> config.env
```

#### Run development server
```bash
npm run dev # yarn dev
```

API is now live at `http://localhost:8080/graphql`!

## API Reference
### Mutations
#### Register
Used to create a user in the database
```graphql
mutation Register(
  $password: String!, 
  $username: String!,
  $firstName: String!, 
  $middleName: String
  $lastName: String!, 
  ) {
  register(
    username: $username
    password: $password, 
    firstName: $firstName,
    middleName: $middleName 
    lastName: $lastName, 
  ){
    token
  }
}
```

Input your `username`, `password`, `firstName` and `lastName` (`middleName` is optional):
```json
{
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD",
  "firstName": "YOUR_FIRST_NAME",
  "lastName": "YOUR_LAST_NAME",
  "middleName": "YOUR_MIDDLE_NAME"
}
```

Responds with a JWT.
```json
{
  "data": {
    "register": {
      "token": "<JWT>"
    }
  }
}
```

### Login
Used to login with your credentials
```graphql
mutation Login(
  $password: String!, 
  $username: String!,
  ) {
  login(
    username: $username
    password: $password, 
  ){
    token
  }
}
```

Input your `username` and `password`:
```json
{
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD",
  "firstName": "YOUR_FIRST_NAME",
  "lastName": "YOUR_LAST_NAME",
  "middleName": "YOUR_MIDDLE_NAME"
}
```

Responds with a JWT.
```json
{
  "data": {
    "login": {
      "token": "<JWT>"
    }
  }
}
```