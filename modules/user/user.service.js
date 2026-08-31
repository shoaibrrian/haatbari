import crypto from "node:crypto";

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors/app-error.js";

import {
  registerUserSchema,
  loginUserSchema,
  toPublicUser,
} from "./user.dto.js";

import {
  createUser,
  findUserByEmail,
  findUserById,
} from "./user.repository.js";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const hashBuffer = Buffer.from(hash, "hex");

  if (originalBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, hashBuffer);
}

export async function registerUser(input) {
  const data = registerUserSchema.parse(input);

  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }

  const user = await createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    passwordHash: hashPassword(data.password),
    role: "buyer",
  });

  return toPublicUser(user);
}

export async function loginUser(input) {
  const data = loginUserSchema.parse(input);

  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const validPassword = verifyPassword(data.password, user.passwordHash);

  if (!validPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return toPublicUser(user);
}

export async function getUser(id) {
  const user = await findUserById(id);

  if (!user) {
    throw new NotFoundError("User");
  }

  return toPublicUser(user);
}
