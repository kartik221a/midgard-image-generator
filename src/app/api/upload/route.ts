import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const { imageUrl, publicId } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let uploadResponse: any;
        // Wait, line 18 was `let uploadResponse: any`. If I change to `let uploadResponse;` it is implicitly any but maybe lint accepts it?
        // Or `let uploadResponse: Record<string, any> | undefined;`
        // Actually, the error `Unexpected any` usually demands explicit type.
        // Let's use `let uploadResponse: Record<string, any> | undefined;`

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            try {
                uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                    public_id: publicId,
                    folder: "storybooks",
                    timeout: 60000, // 60s timeout
                });
                break; // Success
            } catch (err) {
                attempts++;
                console.warn(`Upload attempt ${attempts} failed:`, err);
                if (attempts >= maxAttempts) throw err;
                // Wait 2s before retry
                await new Promise(res => setTimeout(res, 2000));
            }
        }

        return NextResponse.json({
            url: uploadResponse?.secure_url,
            public_id: uploadResponse?.public_id
        });

    } catch (error: unknown) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
