import z from "zod";

export const flashCardStackSchema = z.object({
    flashCards: z.array(
        z.object({
            index: z.number(),
            question: z.string(),
            answer: z.string(),
            source: z.array(z.number()).optional(),
        })
    )
})