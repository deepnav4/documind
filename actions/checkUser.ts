"use server"

import { auth } from "@/utils/auth";

export default async function CheckIfUserExists() {
    const session = await auth()
    const id = session?.user?.id;

    if(!id) {
        console.log("user id is not found, user is probably not logged in, log in first");
        return null;
    }

    return id;
}