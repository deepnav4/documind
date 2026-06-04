import z from "zod";

export const upload_file_schema = z.object({
  file: z
    .instanceof(File, {message: "Invalid File type"})
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "File size must be less than 20MB",
    })
    .refine((file) => file.type.startsWith("application/pdf"), {
      message: "File must be of type pdf",
    }),
}); 