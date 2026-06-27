import { getSummaries } from "@/actions/summary-actions";
import { auth } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function summariesCount() {
    const user = await auth();
    const userId = user?.user?.id;
    if (!userId) {
    console.log("userId from auth not found to server summaries");
    return redirect("/sign-in");
    }
    console.log(`userId from dashboard/page.tsx ${userId}`);

    const summaries = await getSummaries(userId);

    const isLoggoedin = false;
}