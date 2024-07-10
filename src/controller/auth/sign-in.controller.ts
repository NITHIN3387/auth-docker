import prisma from "../../config/prisma.config";
import { compare } from "bcrypt";
import { RequestHandler } from "express";
import { type Secret, sign } from "jsonwebtoken";

const user = prisma.user;

export const signin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const authUser = await user.findUnique({ where: { email } });

  if (!authUser)
    return res.status(404).send("user with this email id not found");

  if (!(await compare(password, authUser.password)))
    return res.status(401).send("incorrect password");

  const token = sign(
    { email: authUser.email },
    process.env.JWT_SECRET_KEY as Secret,
    { expiresIn: "1d" }
  );

  res
    .cookie("authToken", token, {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    })
    .status(200)
    .json({ message: "user signin successfully", token: token });
};