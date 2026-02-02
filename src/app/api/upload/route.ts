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

        let uploadResponse: any;
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
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
        });

    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
