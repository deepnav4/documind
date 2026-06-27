export async function generateEmbeddingsInBatches(allTexts: string[], signal?: AbortSignal) {
    const BATCH_SIZE = 5
    let allEmbeddings: number[][] = []

    try {
        for (let i = 0; i < allTexts.length; i += BATCH_SIZE) {
            if (signal?.aborted) throw new Error("AbortError");
            const textBatch = allTexts.slice(i, i + BATCH_SIZE);
            console.log(`Processing embedding batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(allTexts.length / BATCH_SIZE)}...`)

            const response = await fetch('/api/get-embeddings', {
              method: 'POST',
              body: JSON.stringify({
                text: textBatch
              }),
              signal
            });

            if (!response.ok) {
               console.error("Embedding API failed on batch", response.statusText)
               throw new Error("Failed to fetch embeddings. Rate limit hit?")
            }

            const embeddingResponse = await response.json()
            
            const batchVectors = embeddingResponse.embeddings.embeddings
            allEmbeddings.push(...batchVectors)

            if (i + BATCH_SIZE < allTexts.length) {
                if (signal?.aborted) throw new Error("AbortError");
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
        }

        console.log('All embeddings fully generated! Total count:', allEmbeddings.length)
        return allEmbeddings;
        
    } catch (error: any) {
        if (error.name === "AbortError" || error.message === "AbortError") {
            throw new Error("AbortError");
        }
        console.error("Critical error during batch embedding generation:", error)
        throw error;
    }
}
