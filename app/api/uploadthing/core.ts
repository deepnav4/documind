import { auth } from "@/utils/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({
        pdf : {
            maxFileCount: 1,
            maxFileSize: '8MB'
        }
    })
    .middleware(
        async({req}) => {
            const user = await auth();
            if(!user) throw new UploadThingError("unauthorized");
            return {userId: user.user?.id}
        }
    ).onUploadComplete(
        async({metadata, file}) => {
            console.log("Upload completed for userId", metadata.userId);
            console.log('file url', file.ufsUrl);
            
            return {
                userId : metadata.userId,
                fileUrl : file.ufsUrl
            }
        }
    )
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter