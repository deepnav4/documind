'use server'

import { prisma } from "@/prisma/src/index"
import CheckIfUserExists from "./checkUser"

export async function upsertQuizProgress(
    generatedContentId: string,
    attempts: Record<string, any>,
    isCompleted: boolean = false,
    scores?: any
) {
    try {
        const userId = await CheckIfUserExists();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        const progress = await prisma.featureProgress.upsert({
            where: {
                user_id_generated_content_id: {
                    user_id: userId,
                    generated_content_id: generatedContentId
                }
            },
            update: {
                attempts,
                is_completed: isCompleted,
                ...(scores && { scores })
            },
            create: {
                user_id: userId,
                generated_content_id: generatedContentId,
                attempts,
                is_completed: isCompleted,
                scores: scores || {}
            }
        });

        return { success: true, progress };
    } catch (error: unknown) {
        console.error("Error upserting quiz progress: ", error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "An unknown error occurred" };
    }
}

export async function clearQuizProgress(generatedContentId: string) {
    try {
        const userId = await CheckIfUserExists();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        await prisma.featureProgress.delete({
            where: {
                user_id_generated_content_id: {
                    user_id: userId,
                    generated_content_id: generatedContentId
                }
            }
        });

        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2025') {
            return { success: true }; // Already deleted or didn't exist
        }
        console.error("Error clearing quiz progress: ", error);
        return { success: false, message: error.message };
    }
}
