
"use client";

import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { enhancePrompt, analyzeImage } from "@/lib/openrouter";
import { generateImageInfip } from "@/lib/infip";

interface BulkGeneratorProps {
    prompts: string[];
    characters: any[];
    config: { model: string; aspectRatio: string };
    title?: string;
}

export const useBulkGenerator = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState<"idle" | "running" | "paused" | "completed">("idle");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [bookId, setBookId] = useState<string | null>(null);
    const [consistencyContext, setConsistencyContext] = useState<string | null>(null);

    // Store job config to allow resuming
    const jobConfigRef = useRef<{
        prompts: string[];
        characters: any[];
        config: { model: string; aspectRatio: string };
        bookId: string;
    } | null>(null);

    // Refs for loop control to avoid closure staleness
    const statusRef = useRef(status);
    statusRef.current = status;
    const consistencyContextRef = useRef<string | null>(null);


    const addLog = (msg: string) => setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg} `]);

    const startGeneration = async ({ prompts, characters, config, title }: BulkGeneratorProps) => {
        if (!user) return alert("Please login");
        if (prompts.length === 0) return alert("No prompts");

        try {
            setStatus("running");
            addLog("Initializing Book...");

            // 1. Create Book
            const bookRef = await addDoc(collection(db, "books"), {
                userId: user.uid,
                title: title || "Untitled Book " + new Date().toLocaleDateString(),
                createdAt: serverTimestamp(),
                totalPages: prompts.length,
                status: "generating",
                config,
            });
            setBookId(bookRef.id);
            addLog(`Book created: ${bookRef.id} `);

            // Store config
            jobConfigRef.current = { prompts, characters, config, bookId: bookRef.id };

            // 2. Start Loop (or ensure we are ready to loop)
            // The loop is driven by an effect or a recursive function. 
            // Recursive function usually easier to control pause/stop.
            processQueue(0, bookRef.id, prompts, characters, config);

        } catch (error: any) {
            addLog(`Error starting: ${error.message} `);
            setStatus("idle");
        }
    };

    const processQueue = async (
        index: number,
        activeBookId: string,
        prompts: string[],
        characters: Record<string, unknown>[],
        config: { model: string; aspectRatio: string }
    ) => {
        // Check Status
        if (statusRef.current !== "running") return;
        if (index >= prompts.length) {
            setStatus("completed");
            addLog("All pages completed!");
            await updateDoc(doc(db, "books", activeBookId), { status: "completed" });
            return;
        }

        setCurrentIndex(index);
        const rawPrompt = prompts[index];
        addLog(`Processing Page ${index + 1}/${prompts.length}...`);

        try {
            // 1. Enhance Prompt (with Context if available)
            addLog(`Enhancing prompt...`);
            if (consistencyContextRef.current) addLog(`(Using Visual Consistency Context)`);

            // Pass the CURRENT value of consistencyContext. 
            // NOTE: implementation detail - in a recursive async function or effect loop, 
            // state might be stale if strict closure. 
            // However, since we re-call processQueue with updated state, or if we use a ref.
            // A Ref is safer for the loop.

            const enhancedPrompt = await enhancePrompt(rawPrompt, characters, consistencyContextRef.current || undefined);

            // 2. Generate Image
            addLog(`Generating image (${config.model})...`);
            const result = await generateImageInfip(
                enhancedPrompt,
                config.model,
                config.aspectRatio,
                (msg) => addLog(msg)
            );

            if (!result.success || !result.imageUrl) {
                throw new Error(result.error || "Generation failed");
            }

            // 3. Upload to Cloudinary
            addLog("Uploading to storage...");
            const publicId = `${index + 1}_${activeBookId}`;
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({ imageUrl: result.imageUrl, publicId }),
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.url) throw new Error("Upload failed");

            // 4. Save to Page Collection
            await addDoc(collection(db, "books", activeBookId, "pages"), {
                pageNumber: index + 1,
                originalPrompt: rawPrompt,
                enhancedPrompt,
                imageUrl: uploadData.url,
                createdAt: serverTimestamp(),
            });

            // Set Cover Image & Analyze for Consistency if first page
            if (index === 0) {
                await updateDoc(doc(db, "books", activeBookId), { coverImageUrl: uploadData.url });

                // ANALYZE for Consistency
                try {
                    addLog("Analyzing character for consistency (OpenRouter)...");
                    const visualDescription = await analyzeImage(uploadData.url); // Use Cloudinary URL (publicly accessible)
                    if (visualDescription) {
                        consistencyContextRef.current = visualDescription; // Update Ref
                        setConsistencyContext(visualDescription); // Update State for potential UI display (optional)
                        addLog("Visual Anchor Established: " + visualDescription.slice(0, 30) + "...");
                    }
                } catch (analysisErr) {
                    console.error("Consistency Analysis Failed", analysisErr);
                    addLog("Warning: Consistency analysis failed. Continuing...");
                }
            }

            addLog(`Page ${index + 1} Done.`);

            // 5. Next
            setTimeout(() => {
                // Pass consistencyContextRef.current effectively by reading it in next iteration?
                // Actually, since processQueue is inside the component, it closes over state.
                // But `consistencyContext` variable inside this function scope is stale.
                // The `consistencyContext` used in `enhancePrompt` above was from the scope when `processQueue` was called.
                // We need to ensure the NEXT call gets the new value.
                // Only way is if `enhancePrompt` uses a Ref or if we pass it.
                // I will add `consistencyContextRef` to the component and use that.
                processQueue(index + 1, activeBookId, prompts, characters, config);
            }, 5000); // 5s delay to avoid Rate Limits

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            addLog(`Error on Page ${index + 1}: ${errorMessage}`);
            // Retry or Skip? For now, we'll pause on error or skip. 
            // Let's pause to let user intervene.
            setStatus("paused");
            addLog("Paused due to error.");
        }
    };

    const pauseGeneration = () => {
        setStatus("paused");
        addLog("Paused by user.");
    };

    const resumeGeneration = () => {
        if (status === "paused" && jobConfigRef.current) {
            setStatus("running");
            addLog("Resuming generation...");
            const { prompts, characters, config, bookId } = jobConfigRef.current;
            // Resume from currentIndex
            processQueue(currentIndex, bookId, prompts, characters, config);
        }
    };

    const reset = () => {
        setStatus("idle");
        setCurrentIndex(0);
        setLogs([]);
        setBookId(null);
        setConsistencyContext(null);
        jobConfigRef.current = null;
    };

    return {
        startGeneration,
        pauseGeneration,
        resumeGeneration,
        reset,
        status,
        currentIndex,
        logs,
        bookId
    };
};

