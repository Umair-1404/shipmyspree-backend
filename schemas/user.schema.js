import { z } from "zod";

export const registerSchema = z.object({
  uname: z
    .string({ message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username must be at most 50 characters long" }),
  email: z
    .string({ message: "Email is required" })
    .min(3, { message: "Email must be at least 3 characters long" })
    .max(50, { message: "Email must be at most 50 characters long" })
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Email is not valid",
    }),
  phone_no: z
    .string({ message: "Phone No. is required" })
    .min(6, { message: "Phone No. must be at least 6 characters long" })
    .max(12, { message: "Phone No. must be at most 12 characters long" }),
  pass: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be at most 100 characters long" }),
  fname: z
    .string({ message: "First Name is required" })
    .min(2, { message: "First Name must be at least 2 characters long" })
    .max(50, { message: "First Name must be at most 50 characters long" }),
  lname: z
    .string({ message: "Last Name is required" })
    .min(2, { message: "Last Name must be at least 2 characters long" })
    .max(50, { message: "Last Name must be at most 50 characters long" }),
  email_verified: z.string().optional(),
  otp: z.number().optional(),
  otp_expiry: z.date().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ message: "Email field required" })
    .min(1, "Email field is required"),
  pass: z
    .string({ message: "Password field required" })
    .min(1, "Password field is required"),
});
