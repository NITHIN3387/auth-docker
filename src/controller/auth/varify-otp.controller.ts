import prisma from "../../config/prisma.config";
import { type Secret, verify } from "jsonwebtoken";
import redis from "../../config/redis.config";
import type { RequestHandler } from "express";

const user = prisma.user;

export const varifyOtp: RequestHandler = async (req, res) => {
  const { otp } = req.body;

  const token = req.cookies.varifyToken;

  if (!token) return res.status(410).send("otp has expired");

  const data: any = verify(token, process.env.JWT_SECRET_KEY as Secret);
  const email = data.email;

  const userData = await redis.get(email);

  if (userData) {
    const userParse = JSON.parse(userData);    

    if (userParse.otp == otp) {
      await user.create({
        data: {
          name: userParse.name,
          email: email,
          password: userParse.password,
        },
      });

      return res.status(200).send("email varified successfully");
    } else return res.status(401).send("invalid otp");
  }

  return res.status(410).send("otp has expired");
};