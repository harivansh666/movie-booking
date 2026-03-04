import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import db from "../db/db.conn";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

interface DecodedToken {
  userId: number;
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as DecodedToken;

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    (req as any).user = user[0];

    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
