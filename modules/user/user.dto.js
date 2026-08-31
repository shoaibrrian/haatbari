import { z } from "zod";

const BD_PHONE = /^(?:\+?880|0)1[3-9]\d{8}$/;

const NAME_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;

export const registerUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(60, "First name is too long")
    .regex(NAME_PATTERN, "First name should contain letters only"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(60, "Last name is too long")
    .regex(NAME_PATTERN, "Last name should contain letters only"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(120, "Email is too long"),

  phone: z
    .string()
    .trim()
    .regex(BD_PHONE, "Enter a valid Bangladeshi mobile number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const loginUserSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long"),
});

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user._id?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address || "",
    createdAt: user.createdAt,
  };
}
