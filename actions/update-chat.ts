"use server";

import { prisma } from "@/prisma/src";
import CheckIfUserExists from "./checkUser";
import { auth } from "@/utils/auth";

export async function saveChatHistory(document_id: string, messages: any) {
    const user = await auth();
    if(!user) {
        return {
            success: false,
            message: "Unaunthenticated"
        }
    }

    try {
        await prisma.document.update({
            where: { id: document_id, user_id: user.user?.id },
            data: { chatMessages: messages }
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving chat:", error);
        return { success: false, message: "Failed to save chat" };
    }
}