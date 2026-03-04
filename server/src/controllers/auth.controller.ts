import bcrypt from "bcryptjs";
import db from "../db/db.conn";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../lib/utils";
import type { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check existing user
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    if (!newUser.length) {
      return res.status(400).json({ message: "User creation failed" });
    }

    const user = newUser[0];

    // generate token
    generateToken(user.id, res);

    // remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    console.log("Error in signup controller:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    console.log("Error in signin controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in signout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    res.status(200).json((req as any).user);
  } catch (error: any) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
