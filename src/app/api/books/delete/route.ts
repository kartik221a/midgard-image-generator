import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const { bookId, totalPages } = await request.json();

        if (!bookId) {
            return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
        }

        const publicIds = [];
        // Assuming pages are 1-indexed and named "{pageNumber}_{bookId}" in "storybooks" folder
        // Logic from useBulkGenerator: const publicId = `${index + 1}_${activeBookId}`;
        // and upload folder: "storybooks"

        for (let i = 1; i <= (totalPages || 50); i++) {
            publicIds.push(`storybooks/${i}_${bookId}`);
        }

        if (publicIds.length > 0) {
            // Delete resources allows batch deletion
            await cloudinary.api.delete_resources(publicIds);
        }

        return NextResponse.json({ success: true, deletedCount: publicIds.length });

    } catch (error: any) {
        console.error("Delete API Error:", error);
        // We generally shouldn't fail the whole Delete operation if image delete fails,
        // but monitoring it is good.
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
