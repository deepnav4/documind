import { saveChatReadyDocument } from "@/actions/upload-actions";
import { generateEmbeddingsInBatches } from "./generate-embeddings-client";
import { TChunkSchema } from "@/types/chunk-schema";

export interface TUploadedFile {
    ufsUrl: string;
    url: string;
    name: string;
    key: string;
    size: number;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const processChatUpload = async (uploadedFile: TUploadedFile, onProgress?: (step: number) => void, signal?: AbortSignal) => {
    try {
        if (signal?.aborted) throw new Error("AbortError");
        console.log("Starting Chat Processing for: ", uploadedFile.name);
        
        onProgress?.(2); // Step 2: Extracting Text Structure
        const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
        const pythonApiUrl = `${baseUrl}/get-chunks?source=${uploadedFile.ufsUrl}`;
        console.log("Calling Python Engine: ", pythonApiUrl);
        
        const fileText = await fetch(pythonApiUrl, { signal });
        const fileJson = await fileText.json();
        
        if (signal?.aborted) throw new Error("AbortError");
        const chunks = fileJson.chunks;
        const allTexts = chunks.map((chunk: TChunkSchema) => chunk.text);
        console.log(`Extracted ${allTexts.length} chunks. Generating embeddings...`);
        
        onProgress?.(3); // Step 3: Generating Vector Embeddings
        const allEmbeddings = await generateEmbeddingsInBatches(allTexts, signal);

        if (signal?.aborted) throw new Error("AbortError");
        const finalEmbeddingData = chunks.map((chunk: TChunkSchema, index: number) => {
            return {
                text: chunk.text,
                meta: chunk.meta,
                embedding: allEmbeddings[index],
            };
        });

        console.log("Embeddings successfully stitched to chunks. Saving to Database...");

        onProgress?.(4); // Step 4: Saving Knowledge Base
        if (signal?.aborted) throw new Error("AbortError");
        const saveChatReadyDocumentResponse = await saveChatReadyDocument({
            original_file_url: uploadedFile.ufsUrl,
            file_name: uploadedFile.name,
            file_key: uploadedFile.key,
            file_size: formatBytes(uploadedFile.size),
            finalEmbeddingData,
        });

        console.log("Final Database Response: ", saveChatReadyDocumentResponse);
        
        return saveChatReadyDocumentResponse;
        
    } catch (error: any) {
        if (error.name === "AbortError" || error.message === "AbortError") {
            console.log("Process completely aborted by user signal.");
            throw new Error("AbortError");
        }
        console.error("Critical error inside processChatUpload:", error);
        throw error;
    }
}