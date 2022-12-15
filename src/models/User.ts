import { Field, ObjectType, ID } from "type-graphql";
import { prop, modelOptions, getModelForClass, pre, DocumentType } from "@typegoose/typegoose";
import { Schema } from "mongoose";
import bc from "bcryptjs";
import crypto from "crypto";

interface UserParams{
  _id: Schema.Types.ObjectId,
  createdAt: Date,
  username: string,
  firstName: string,
  middleName?: string,
  lastName: string
}

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users"
  }
})
// Every time the document is saved, this will run before it does.
@pre<User>("save", async function(next){
  if (!this.isModified("password")){ // if the password is not modified, do nothing
    return next();
  }

  // Encrypt the password
  const salt = await bc.genSalt(10);
  this.password = await bc.hash(this.password, salt);

  return next();

})
export class User{
  constructor(params: UserParams){
    Object.assign(this, params)
  }

  @Field(returns => ID)
  readonly _id: Schema.Types.ObjectId;

  @Field()
  readonly createdAt: Date;

  @Field()
  @prop({ 
    required: true, 
    unique: true, 
    minlength: 6, 
    maxlength: 20, 
  })
  public username: string;

  @prop({ 
    required: true, 
    minlength: 6, 
    validate: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d])/, 
    select: false
  })
  public password: string;

  @Field()
  @prop({ required: true })
  public firstName: string;

  @Field({ nullable: true })
  @prop()
  public middleName?: string;

  @Field()
  @prop({ required: true })
  public lastName: string;

  @prop()
  public resetPasswordToken?: string;

  @prop()
  public resetPasswordExpire?: Date;

  // Checks if a given password matches the encrypted password
  public async checkPassowrds(this: DocumentType<User>, password: string){
    const valid = await bc.compare(password, this.password);
    return valid;
  }

  // Generates a password reset token and saves an encrypted version to the doc
  public async getPasswordResetToken(this: DocumentType<User>){
    const token = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    this.resetPasswordExpire = new Date(Date.now() + (10 * (60 * 1000))) // 10 minutes

    await this.save();

    return token;
  }

}

export const UserModel = getModelForClass(User);