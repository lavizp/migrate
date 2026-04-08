import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users, type User } from "@migrate/db";
import { eq } from "drizzle-orm";
import { env } from "@migrate/env/server";

const SALT_ROUNDS = 10;
const JWT_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(user: Pick<User, "id" | "email">): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export async function createUser(
  email: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const result = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning();
  const user = result[0];
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
}

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}