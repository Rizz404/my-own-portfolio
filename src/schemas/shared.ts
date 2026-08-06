import { z } from "zod";

// * Helper buat validasi field yang di tipe TS-nya `string` polos tapi isinya
// sebenernya salah satu key dari native enum (mis. UseRequest.category, SkillRequest.category).
// Numeric enum di TS punya reverse mapping (0: "software", software: 0), jadi
// Object.keys() bakal ngembaliin key angka + key string sekaligus - filter yang angka aja.
export function enumStringKeys<T extends Record<string, string | number>>(enumObject: T) {
  const keys = Object.keys(enumObject).filter((key) => Number.isNaN(Number(key)));
  return keys as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];
}

// * Snowflake ID string dari backend, dipake buat validasi path/id field.
export const snowflakeIdSchema = z.string().min(1, "ID is required");

// * File upload kosong dianggap "gak ada file" (input file yang di-reset balikin
// FileList kosong / undefined), jadi optional file field pake ini biar konsisten.
export const optionalFileSchema = z.instanceof(File).optional();
export const optionalFileArraySchema = z.array(z.instanceof(File)).optional();
