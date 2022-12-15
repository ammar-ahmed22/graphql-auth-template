import jwt from "jsonwebtoken";
import { AuthChecker, ObjectType, Field } from "type-graphql";

export interface Context{
  userId?: string
}

// Used with type-graphql for @Authorized
export const authChecker: AuthChecker<Context> = ({ context }) : boolean => !!context.userId;

@ObjectType()
export class AuthPayload{
  @Field()
  public token: string;

  private createJWT = (payload: string | object | Buffer ) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN as string
    })
  }

  constructor(payload: string | object | Buffer){
    this.token = this.createJWT(payload);
  }
}

