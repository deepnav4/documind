'use server'

import { prisma } from "@/prisma/src/index"
import CheckIfUserExists from "./checkUser"
import { UTApi } from "uploadthing/server"

const utapi = new UTApi();
export const deletePdfFile = async (documentId: string) => {
    try {
        const userId = await CheckIfUserExists();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId, user_id: userId }
        });

        if (!document) {
            return { success: false, message: "Document not found" };
        }

        await prisma.document.delete({
            where: { id: documentId }
        });

        if (document.file_key) {
            await utapi.deleteFiles(document.file_key);
            console.log(`Successfully purged ${document.file_key} from UploadThing.`);
        }

        return { success: true };
    } catch (err: any) {
        console.error("Error completely deleting project: ", err);
        return { success: false, message: err.message || "Failed to delete" };
    }
}

export const deleteFileByKey = async (fileKey: string) => {
    try {
        const userId = await CheckIfUserExists();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        await utapi.deleteFiles(fileKey);
        console.log(`Successfully deleted ${fileKey} from UploadThing.`);

        return { success: true };
    } catch (err: any) {
        console.error("Error deleting file by key: ", err);
        return { success: false, message: err.message || "Failed to delete" };
    }
}

type TFinalEmbeddingData = {
    text: string;
    meta: JSON;
    embedding: number[];
}

type TSaveChatReadyDocumentProps = {
    original_file_url: string;
    file_name: string;
    file_key: string;
    file_size?: string;
    finalEmbeddingData: TFinalEmbeddingData[];
}

export async function saveChatReadyDocument({
    original_file_url,
    file_name,
    file_key,
    file_size,
    finalEmbeddingData
}: TSaveChatReadyDocumentProps) {
    try {
        const userId = await CheckIfUserExists();

        if(!userId) {
            return { success: false, message: "User not authenticated" };
        }

        console.log("Creating base Document in DB...");
        const newDoc = await prisma.document.create({
            data: {
                user_id: userId,
                original_file_url,
                file_name,
                file_key,
                file_size,
            }
        });

        console.log(`Base Document Created: ${newDoc.id}. Inserting ${finalEmbeddingData.length} chunks with vectors...`);

        const sqlOperations = finalEmbeddingData.map((chunk) => {
            const newChunkId = crypto.randomUUID(); 
            const stringifiedVector = JSON.stringify(chunk.embedding);
            
            return prisma.$executeRaw`
                INSERT INTO "DocumentChunk" (id, document_id, text, metadata, embedding, created_at)
                VALUES (${newChunkId}, ${newDoc.id}, ${chunk.text}, ${chunk.meta}::jsonb, ${stringifiedVector}::vector, NOW())
            `;
        });

        await prisma.$transaction(sqlOperations);
        
        console.log(`Successfully saved ${finalEmbeddingData.length} vectorized chunks!`);
        
        return { 
            success: true, 
            message: "Chat document indexed and saved.", 
            document_id: newDoc.id 
        };

    } catch (error) {
        console.error("Error saving Chat Document: ", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Database Error while saving embeddings."
        }
    }
}

export async function getDocumentById(documentId: string) {
    try {
        const userId = await CheckIfUserExists();

        if(!userId) {
            return { success: false, message: "User not authenticated" };
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId, user_id: userId },
            include: { 
                generated_content: {
                    include: {
                        progress: {
                            where: { user_id: userId }
                        }
                    }
                } 
            }
        });

        if(!document) {
            return { success: false, message: "Document not found" };
        }

        return { success: true, document };
    } catch (error) {
        console.error("Error getting document by ID: ", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Database Error while getting document."
        }
    }
}

export async function getAllDocumentsByUserId() {
    try {
        const userId = await CheckIfUserExists();

        if(!userId) {
            return { success: false, message: "User not authenticated" };
        }

        const documents = await prisma.document.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" }
        });

        if(!documents) {
            return { success: false, message: "Documents not found" };
        }

        return { success: true, documents };
    } catch (error) {
        console.error("Error getting documents by user ID: ", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Database Error while getting documents."
        }
    }
}

type TFinalChunkData = {
    text: string;
    meta: JSON;
};

type TSaveFeatureDocumentProps = {
    original_file_url: string;
    file_name: string;
    file_key: string;
    file_size?: string;
    chunks: TFinalChunkData[];
    feature_type: string;
    generated_data: any;
    title?: string;
};

export async function saveFeatureDocumentWithChunks({
    original_file_url,
    file_name,
    file_key,
    file_size,
    chunks,
    feature_type,
    generated_data,
    title
}: TSaveFeatureDocumentProps) {
    try {
        const userId = await CheckIfUserExists();

        if(!userId) {
            return { success: false, message: "User not authenticated" };
        }

        console.log("Creating base Document for feature...");
        const newDoc = await prisma.document.create({
            data: {
                user_id: userId,
                original_file_url,
                file_name,
                file_key,
                file_size,
            }
        });

        console.log(`Document Created: ${newDoc.id}. Inserting ${chunks.length} chunks without vectors...`);

        const sqlOperations = chunks.map((chunk) => {
            const newChunkId = crypto.randomUUID(); 
            
            return prisma.$executeRaw`
                INSERT INTO "DocumentChunk" (id, document_id, text, metadata, created_at)
                VALUES (${newChunkId}, ${newDoc.id}, ${chunk.text}, ${chunk.meta}::jsonb, NOW())
            `;
        });

        await prisma.$transaction(sqlOperations);
        
        console.log(`Successfully saved ${chunks.length} raw chunks. Creating GeneratedContent block...`);
        
        const generatedContentEntry = await prisma.generatedContent.create({
            data: {
                document_id: newDoc.id,
                feature_type,
                title: title || "Generated Content",
                data: generated_data
            }
        });

        return { 
            success: true, 
            message: "Project successfully saved.", 
            document_id: newDoc.id 
        };

    } catch (error) {
        console.error("Error saving Feature Document: ", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Database Error while saving feature project."
        }
    }
}

export async function checkIfEmbeddingsExist(documentId: string) {
    try {
        const userId = await CheckIfUserExists();
        if(!userId) {
            return { success: false, message: "User not authenticated", isReady: false };
        }
        
        const result: any = await prisma.$queryRaw`
            SELECT 
                COUNT(*) as total_chunks,
                COUNT(embedding) as embedded_chunks
            FROM "DocumentChunk"
            WHERE document_id = ${documentId}
        `;

        if (!result || result.length === 0) {
            return { success: true, isReady: false, message: "No chunks found." };
        }
        
        const total = Number(result[0].total_chunks);
        const embedded = Number(result[0].embedded_chunks);

        const isReady = total > 0 && total === embedded;
        return { success: true, isReady, total, embedded };
        
    } catch (err: any) {
        console.error("Error checking embeddings: ", err);
        return { success: false, message: err.message || "Failed to check embeddings", isReady: false };
    }
}

export async function getDocumentChunksRaw(documentId: string) {
    try {
        const userId = await CheckIfUserExists();
        if(!userId) {
            return { success: false, message: "Unauthenticated" };
        }
        
        const chunks = await prisma.documentChunk.findMany({
            where: { document_id: documentId },
            select: { id: true, text: true, metadata: true },
            orderBy: { created_at: "asc" }
        });

        return { success: true, chunks };
    } catch (err: any) {
        console.error("Error getting chunks: ", err);
        return { success: false, message: err.message };
    }
}

type TUpdateEmbeddingData = {
    id?: string;
    text: string;
    meta: any;
    embedding: number[];
}

export async function processExistingDocumentForChat(documentId: string, finalEmbeddingData: TUpdateEmbeddingData[]) {
    try {
        const userId = await CheckIfUserExists();
        if(!userId) {
            return { success: false, message: "Unauthenticated" };
        }

        const doc = await prisma.document.findUnique({
            where: { id: documentId, user_id: userId }
        });

        if (!doc) return { success: false, message: "Document not found" };

        const sqlOperations = finalEmbeddingData.map((chunk) => {
            const stringifiedVector = JSON.stringify(chunk.embedding);
            
            if (chunk.id) {
                return prisma.$executeRaw`
                    UPDATE "DocumentChunk"
                    SET embedding = ${stringifiedVector}::vector
                    WHERE id = ${chunk.id} AND document_id = ${documentId}
                `;
            } else {
                const newChunkId = crypto.randomUUID(); 
                return prisma.$executeRaw`
                    INSERT INTO "DocumentChunk" (id, document_id, text, metadata, embedding, created_at)
                    VALUES (${newChunkId}, ${documentId}, ${chunk.text}, ${chunk.meta}::jsonb, ${stringifiedVector}::vector, NOW())
                `;
            }
        });

        await prisma.$transaction(sqlOperations);

        return { success: true, message: "Document chunks updated with embeddings." };
    } catch (err: any) {
        console.error("Error updating document with embeddings: ", err);
        return { success: false, message: err.message };
    }
}

export async function addGeneratedContentToExistingDocument(
    documentId: string,
    featureType: string,
    generatedData: any,
    title: string,
    chunksToInsert?: any[] // Optional: insert chunks if they don't exist yet
) {
    try {
        const userId = await CheckIfUserExists();
        if(!userId) return { success: false, message: "Unauthorized" };

        const doc = await prisma.document.findUnique({
            where: { id: documentId, user_id: userId }
        });

        if (!doc) return { success: false, message: "Document not found" };

        const operations = [];

        if (chunksToInsert && chunksToInsert.length > 0) {
            chunksToInsert.forEach((chunk) => {
                const newChunkId = crypto.randomUUID(); 
                operations.push(prisma.$executeRaw`
                    INSERT INTO "DocumentChunk" (id, document_id, text, metadata, created_at)
                    VALUES (${newChunkId}, ${documentId}, ${chunk.text}, ${chunk.meta || chunk.metadata}::jsonb, NOW())
                `);
            });
        }

        const generatedContentEntry = prisma.generatedContent.create({
            data: {
                document_id: documentId,
                feature_type: featureType,
                title: title,
                data: generatedData
            }
        });
        
        operations.push(generatedContentEntry);

        await prisma.$transaction(operations);

        return { success: true, message: "Generated content added successfully." };
    } catch (err: any) {
        console.error("Error adding generated content to document: ", err);
        return { success: false, message: err.message };
    }
}

export async function deleteGeneratedContent(contentId: string) {
    try {
        const userId = await CheckIfUserExists();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        // Must verify it belongs to user first via document
        const content = await prisma.generatedContent.findUnique({
            where: { id: contentId },
            include: { document: true }
        });

        if (!content || content.document.user_id !== userId) {
            return { success: false, message: "Content not found" };
        }

        await prisma.generatedContent.delete({
            where: { id: contentId }
        });

        return { success: true };
    } catch (err: any) {
        console.error("Error deleting generated content: ", err);
        return { success: false, message: err.message || "Failed to delete content" };
    }
}