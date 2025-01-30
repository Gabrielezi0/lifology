import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";

const JWT_SECRET = process.env.JWT_SECRET!;

export const getUserFromToken = (req: NextApiRequest) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
