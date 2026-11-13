import { z } from "zod";

const FileSchema = z
  .object({
    actual: z.string().nullable(),
    expected: z.string(),
    path: z.string(),
  })
  .readonly();

export const SnapshotSchema = z
  .object({
    files: z.array(FileSchema).readonly(),
  })
  .readonly();

export const JsonSchema = z.json();

export type Json = z.infer<typeof JsonSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type File = z.infer<typeof FileSchema>;
