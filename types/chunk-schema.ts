import z from "zod";

export const chunkSchema = z.object({
    text: z.string(),
    meta: z.object({
        filename: z.string(),
        headings: z.array(z.string()).optional().default([]),
        page_numbers: z.array(z.number()).optional().default([]),
        types: z.array(z.string()).optional().default([])
    })
})

export const chunkSchemaArray = z.array(chunkSchema)

export type TChunkSchema = z.infer<typeof chunkSchema>
export type TChunkSchemaArray = z.infer<typeof chunkSchemaArray>
