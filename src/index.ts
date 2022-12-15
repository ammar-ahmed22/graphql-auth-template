import "reflect-metadata" // Required for TypeGraphQL
import dotenv from "dotenv";
dotenv.config({ path: "config.env" });
import { ApolloServer } from "@apollo/server";
import { buildSchema } from "type-graphql";
import { expressMiddleware } from "@apollo/server/express4"
import express from "express";
import cors from "cors";
import { connect } from "./utils/db";
import { authChecker, Context } from "./utils/auth";
import { verify } from "jsonwebtoken";

import { UserResolver } from "./resolvers/User";

( async () => {

  const schema = await buildSchema({
    resolvers: [UserResolver],
    dateScalarMode: "timestamp",
    emitSchemaFile: {
      path: __dirname + "/schema.gql"
    },
    authChecker
  });

  const app = express();

  const server = new ApolloServer({
    schema,
  })

  if (process.env.MONGO_URI) await connect(process.env.MONGO_URI);

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware<Context>(server, {
      context: async ({ req }) => {
        // No authorization header or invalid header, return empty object
        if (
          !req.headers.authorization ||
          !req.headers.authorization.split(" ")[1]
        ){
          return {}
        }

        // Authorization: Bearer <token>
        const token = req.headers.authorization.split(" ")[1];

        // extract JWT payload
        const payload = <{ id: string }>(
          verify(token, process.env.JWT_SECRET as string)
        )

        // Return context with userId
        return {
          userId: payload.id
        }
      }
    }),
  )

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)})
  
})()
