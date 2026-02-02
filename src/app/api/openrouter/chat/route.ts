import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1";

export async function POST(request: Request) {
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json(
            { success: false, error: "Server configuration error: Missing OpenRouter API Key" },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { model, messages, max_tokens } = body;

        const MAX_RETRIES = 3;
        const BASE_DELAY = 1000;
        let attempt = 0;
        let response;
        let lastError;

        while (attempt < MAX_RETRIES) {
            try {
                if (attempt > 0) {
                    // Exponential backoff: 1000, 2000, 4000
                    const delay = BASE_DELAY * Math.pow(2, attempt - 1);
                    console.log(`[OpenRouter] Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                response = await fetch(`${BASE_URL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://midgard-story.com",
                        "X-Title": "Midgard Story Generator",
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        max_tokens,
                    }),
                });

                if (response.ok) {
                    break;
                } else if (response.status === 429) {
                    // Specific handling for 429 (Rate Limit) -> Continue loop to retry
                    console.warn(`[OpenRouter] Rate limited (429) on attempt ${attempt + 1}`);
                    lastError = await response.text();
                } else {
                    // Other errors (400, 401, 500 etc) -> Break immediately, don't retry blindly
                    lastError = await response.text();
                    break;
                }

            } catch (err: any) {
                console.error(`[OpenRouter] Network failure on attempt ${attempt + 1}:`, err);
                lastError = err.message;
            }
            attempt++;
        }

        if (!response || !response.ok) {
            console.error(`OpenRouter API Failed after ${attempt} attempts. Last status: ${response?.status}`);
            return NextResponse.json(
                {
                    success: false,
                    error: `Upstream error: ${response?.statusText || "Unknown Error"}`,
                    details: lastError
                },
                { status: response?.status || 500 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("OpenRouter Proxy Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
