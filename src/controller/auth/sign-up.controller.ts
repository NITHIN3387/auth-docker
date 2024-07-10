import prisma from "../../config/prisma.config";
import { genSalt, hash } from "bcrypt";
import { type Secret, sign } from "jsonwebtoken";
import sendMail from "../../utils/send-mail";
import redis from "../../config/redis.config";
import type { RequestHandler } from "express";
import { OTP_EXPIRATION_TIME, SALT_ROUND } from "./auth.constantValues";

const user = prisma.user;

export const signup: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const duplicateUser = await user.findUnique({ where: { email } });

    if (duplicateUser)
      return res.status(409).send("An user already signup with this email id");

    const salt = await genSalt(SALT_ROUND).catch((err) =>
      res
        .status(500)
        .json({ message: "Internal server error (bcrypt salt)", err })
    );

    const hashPassword = await hash(password, salt as string).catch((err) =>
      res
        .status(500)
        .json({ message: "Internal server error (password hash)", err })
    );

    const otp = Math.floor(1000 + Math.random() * 9000);

    await sendMail(email, "email varification", `your otp is ${otp}`).catch(
      (err) => res.status(500).json({ message: "Fail to send the email", err })
    );

    const userData = {
      name,
      password: hashPassword,
      otp,
    };

    redis.set(email, JSON.stringify(userData), "EX", OTP_EXPIRATION_TIME);

    const token = sign({ email }, process.env.JWT_SECRET_KEY as Secret, {
      expiresIn: 300000,
    });

    res
      .cookie("varifyToken", token, {
        maxAge: 5 * 60 * 1000,
        sameSite: "strict",
        httpOnly: true,
      })
      .send("an otp has sent to your email id successfully");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", err });
  }
};
