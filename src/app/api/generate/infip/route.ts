import { NextResponse } from "next/server";

const INFIP_API_KEY = process.env.INFIP_API_KEY;
const BASE_URL = "https://api.infip.pro/v1";

export async function POST(request: Request) {
    try {
        if (!INFIP_API_KEY) {
            return NextResponse.json(
                { success: false, error: "Server configuration error: Missing API Key" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { prompt, model, size } = body;

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Missing prompt" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${INFIP_API_KEY}`,
            },
            body: JSON.stringify({
                model: model || "z-image-turbo",
                prompt: prompt,
                n: 1,
                size: size || "1024x1024",
                response_format: "url"
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Infip API Error (${response.status}):`, errorText);
            return NextResponse.json(
                { success: false, error: `Upstream error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Infip Upstream Response:", JSON.stringify(data, null, 2)); // DEBUG LOG
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("Internal API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// Polling Handler
export async function GET(request: Request) {
    try {
        if (!INFIP_API_KEY) {
            return NextResponse.json(
                { success: false, error: "Server configuration error: Missing API Key" },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");

        if (!taskId) {
            return NextResponse.json(
                { success: false, error: "Missing taskId" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${INFIP_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Infip Poll Error (${response.status}):`, errorText);
            return NextResponse.json(
                { success: false, error: `Poll failed: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("Internal Poll Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
