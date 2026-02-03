import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        let uploadResponse: UploadApiResponse | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { imageUrl, publicId, enhance } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
        }

        const uploadOptions: UploadApiOptions = {
            public_id: publicId,
            folder: "storybooks",
            timeout: 60000, // 60s timeout
        };

        if (enhance) {
            uploadOptions.transformation = [
                { effect: "improve" },      // Basic enhancement (correct SDK syntax for e_improve)
                { effect: "sharpen:100" },  // Extra sharpness (correct SDK syntax for e_sharpen:100)
                { effect: "upscale" }       // AI upscaling (correct SDK syntax for e_upscale)
            ];
        }

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            try {
                uploadResponse = await cloudinary.uploader.upload(imageUrl, uploadOptions);
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
