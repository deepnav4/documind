import { prisma } from "@/prisma/src";

export async function getSummaryId(id : string) {
    try {
        const sql =await prisma.pdfSummary.findMany({
            where: {
                id: id
            },
            
        })
    } catch (error) {
        console.log("Error fetching summaryId", error);
        return null
    }
}