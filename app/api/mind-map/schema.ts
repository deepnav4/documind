import z from "zod";

type MindMapNode = {
    index: Number,
    point : string,
    subPoints?: MindMapNode[];
}
const mindMapNodeSchema: z.ZodType<MindMapNode> = z.lazy(() => z.object({
    index: z.number(),
    point: z.string(),
    subPoints: z.array(mindMapNodeSchema).optional()
}))

export const mindMapSchema = z.object({
    mindMap: z.array(mindMapNodeSchema),
    topic: z.string()
})

export type TMindMapSchema = z.infer<typeof mindMapNodeSchema>;

export const mindMapSummarySchema = z.object({
    summaryNodes: z.array(z.object({
        concept: z.string(),
        details: z.string(),
    }))
})