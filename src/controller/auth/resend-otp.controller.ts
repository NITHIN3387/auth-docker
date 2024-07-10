import { type Secret, sign, verify } from "jsonwebtoken";
import sendMail from "../../utils/send-mail";
import redis from "../../config/redis.config";
import type { RequestHandler } from "express";
import { OTP_EXPIRATION_TIME } from "./auth.constantValues";

export const resendOtp: RequestHandler = async (req, res) => {
  const varifyToken = req.cookies.varifyToken;

  if (!varifyToken) return res.status(410).send("session has expired, register again");

  const data: any = verify(varifyToken, process.env.JWT_SECRET_KEY as Secret);
  const email = data.email;

  const userData = await redis.get(email)

  if (!userData)
    return res.status(410).send("session has expired, register again");  

  const userParse = JSON.parse(userData)
  
  const otp = Math.floor(1000 + Math.random() * 9000);

  const user = {
    ...userParse,
    otp
  }

  await sendMail(email, "email varification", `your otp is ${otp}`).catch(
    (err) => res.status(500).json({ message: "Fail to send the email", err })
  );

  redis.set(email, JSON.stringify(user), "EX", OTP_EXPIRATION_TIME);

  const token = sign({ email }, process.env.JWT_SECRET_KEY as Secret, {
    expiresIn: 300000,
  });

  return res
    .cookie("varifyToken", token, {
      maxAge: 5 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    })
    .send("an otp has sent to your email id again");
};
