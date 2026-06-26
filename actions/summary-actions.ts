"use server"

import { prisma } from "@/prisma/src"
import { revalidatePath } from "next/cache"
import CheckIfUserExists from "./checkUser"

export async function getSummaries(userId: string) {
    const summaries = await prisma.pdfSummary.findMany({
        where: {
            user_id: userId
        },
        orderBy: {
            created_at: "desc"
        }
    })

    return summaries
}

export async function getIndividualSummary({userId, summaryId} : {userId: string, summaryId: string}){
    const individualSummary = await prisma.pdfSummary.findUnique({
        where : {
            user_id: userId,
            id: summaryId
        }
    })
    return individualSummary
}

export async function deleteSummaryAction({summaryId}: {summaryId: string}){
    try {
        const getUserId = await CheckIfUserExists()

        if(!getUserId) {
            return {
                success: false,
                message: "User not found"
            }
        }

        const summaryToDelete = await prisma.pdfSummary.delete({
        where: {
            id: summaryId,
            user_id: getUserId
        }
    })

    if(!summaryToDelete) {
        return {
            success: false,
            message: "Summary not found, wrong command triggered"
        }
    }

    revalidatePath('/dashboard')
    return {
        success: true,
        message: "Summary deleted"
    }

    } catch (error) {
        console.error("error deleting summary", error)
        return {
            success: false,
            message: "unable to delete summary"
        }
    }
}