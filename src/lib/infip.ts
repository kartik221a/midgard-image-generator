

export interface GenerationResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

// Helper to map aspect ratios to supported sizes
const mapAspectRatioToSize = (aspectRatio: string): string => {
    switch (aspectRatio) {
        case "16:9":
            return "1792x1024";
        case "9:16":
            return "1024x1792";
        case "1:1":
        default:
            return "1024x1024";
    }
};

export const generateImageInfip = async (
    prompt: string,
    model: string = "z-image-turbo",
    aspectRatio: string = "1:1",
    onProgress?: (status: string) => void
): Promise<GenerationResult> => {
    try {
        const size = mapAspectRatioToSize(aspectRatio);

        // Call our own internal API route (which handles the secret Key and CORS)
        const response = await fetch("/api/generate/infip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                prompt,
                size,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Request failed with status ${response.status}`;
            const details = errorData.details ? ` (${errorData.details})` : "";
            throw new Error(errorMessage + details);
        }

        const data = await response.json();

        // Check for OpenAI-compatible response format (Immediate success)
        if (data.data && data.data.length > 0 && data.data[0].url) {
            return { success: true, imageUrl: data.data[0].url };
        }

        // Check for Async Pending Status
        if (data.status === "pending" && data.task_id) {
            const taskId = data.task_id;
            let attempts = 0;
            const maxAttempts = 90; // 90 * 2s = 180s timeout (3 mins)

            console.log(`Infip Task Pending (${taskId}). Polling...`);
            if (onProgress) onProgress(`Task pending (${taskId}). Polling...`);

            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s

                const pollRes = await fetch(`/api/generate/infip?taskId=${taskId}`);
                if (!pollRes.ok) {
                    // Retry on network error? Or fail?
                    // Let's retry a few times but logging it
                    console.warn("Poll request failed, retrying...");
                    attempts++;
                    continue;
                }

                const pollData = await pollRes.json();

                // CHECK FOR SUCCESS (Implicit completion via data return)
                if (pollData.data && pollData.data.length > 0 && pollData.data[0].url) {
                    if (onProgress) onProgress(`Generation complete!`);
                    return { success: true, imageUrl: pollData.data[0].url };
                }

                console.log("Poll Status:", pollData.status);
                if (onProgress) onProgress(`Polling: ${pollData.status || "processing..."} (${attempts + 1}/${maxAttempts})`);

                if (pollData.status === "completed" || pollData.status === "succeeded") {
                    // Should be covered by above check, but keeping as fallback if structure differs
                    const url = pollData.result?.url || pollData.output?.url || pollData.url || (Array.isArray(pollData.data) ? pollData.data[0]?.url : null);

                    if (url) return { success: true, imageUrl: url };

                    return { success: false, error: "Completed but no URL found. Raw: " + JSON.stringify(pollData) };
                }

                if (pollData.status === "failed") {
                    return { success: false, error: `Generation failed: ${pollData.error || "Unknown error"}` };
                }

                attempts++;
            }
            return { success: false, error: "Polling timeout" };
        }

        return { success: false, error: "No image URL in response. Raw data: " + JSON.stringify(data) };

    } catch (error: unknown) {
        console.error("Infip Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: errorMessage };
    }
};

// Polling is removed as the primary endpoint appears synchronous based on Swagger.
// If actual 'nbpro' usage differs, we might need to restore it. 

