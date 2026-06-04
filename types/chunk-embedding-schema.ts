import z from "zod";

export const chunkEmbeddingSchema = z.object({
    text: z.string(),
    meta: z.object({
        filename: z.string(),
        headings: z.array(z.string()).optional().default([]),
        page_numbers: z.array(z.number()).optional().default([]),
        types: z.array(z.string()).optional().default([])
    }),
    embedding: z.array(z.number())
})

export const chunkEmbeddingSchemaArray = z.array(chunkEmbeddingSchema)

export type TChunkEmbeddingSchema = z.infer<typeof chunkEmbeddingSchema>
export type TChunkEmbeddingSchemaArray = z.infer<typeof chunkEmbeddingSchemaArray>