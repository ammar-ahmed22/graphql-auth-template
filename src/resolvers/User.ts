import { Mutation, Query, Resolver, Arg, Authorized, Ctx } from "type-graphql";
import { UserModel, User } from "../models/User";
import { AuthPayload, Context } from "../utils/auth";
import crypto from "crypto";

@Resolver()
export class UserResolver{

  @Mutation(returns => AuthPayload)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("middleName", { nullable: true }) middleName?: string
  ){

    const existing = await UserModel.findOne({ username });
    if (existing) throw new Error("User already exists!");

    const user = await UserModel.create({
      username,
      password,
      firstName,
      lastName,
      middleName
    })

    console.log(user);
    return new AuthPayload({ id: user._id });
  }

  @Mutation(returns => AuthPayload)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ){
    const user = await UserModel.findOne({ username }).select("+password");
    const errorMsg = "Invalid credentials. Check email or password.";

    if (!user) throw new Error(errorMsg);

    const valid = await user.checkPassowrds(password);

    if (!valid) throw new Error(errorMsg);

    return new AuthPayload({ id: user._id });
  }

  @Mutation(returns => String)
  async forgotPassword(
    @Arg("username") username: string
  ){
    const user = await UserModel.findOne({ username });

    if (!user) throw new Error("User not found!")

    const token = await user.getPasswordResetToken();

    return token;
  }

  @Mutation(returns => Boolean)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ){

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({ resetPasswordToken: tokenHash });

    if (!user) throw new Error("Invalid token!")

    if (user.resetPasswordExpire && user.resetPasswordExpire <= new Date()){
      throw new Error("Token is expired!")
    }

    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    user.password = newPassword;

    await user.save();

    return true;

  }

  @Authorized()
  @Mutation(returns => AuthPayload)
  async updateName(
    @Ctx() ctx: Context,
    @Arg("firstName", { nullable: true }) firstName?: string,
    @Arg("lastName", { nullable: true }) lastName?: string,
    @Arg("middleName", { nullable: true }) middleName?: string,
  ){
    const { userId } = ctx;

    const user = await UserModel.findById(userId);

    if (!user) throw new Error("User not found!");

    if (firstName) user.firstName = firstName;
    if (middleName) user.middleName = middleName;
    if (lastName) user.lastName = lastName;

    await user.save();

    return new AuthPayload({ id: user._id })
  }

  @Authorized()
  @Query(returns => User)
  async user(
    @Ctx() ctx: Context
  ){

    const { userId } = ctx;

    const user = await UserModel.findById(userId).lean().exec();

    if (!user) throw new Error("User not found!");

    return new User(user)
  }
}