import { z } from "zod/v4";

export const phoneSchema = z
  .string()
  .min(10, "Nomor HP minimal 10 digit")
  .max(15, "Nomor HP maksimal 15 digit")
  .regex(/^[0-9+]+$/, "Nomor HP hanya boleh angka");

export const nameSchema = z
  .string()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama maksimal 100 karakter");

export const amountSchema = z
  .number()
  .min(0, "Nominal tidak boleh negatif")
  .max(999999999999, "Nominal terlalu besar");
