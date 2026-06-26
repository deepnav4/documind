'use server'

import { prisma } from "@/prisma/src/index";

export async function getUserDocuments(userId: string) {
    try {
        const documents = await prisma.document.findMany({
            where: { user_id: userId },
            include: {
                _count: {
                    select: { chunks: true }
                },
                generated_content: {
                    select: { feature_type: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        
        return documents;
    } catch (err) {
        console.error("Error fetching user documents:", err);
        return [];
    }
}
