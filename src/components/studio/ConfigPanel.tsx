"use client";

import { Settings, Box, Wand2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
    model: string;
    setModel: (model: string) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    isAIEnabled: boolean;
    setIsAIEnabled: (enabled: boolean) => void;
    isImageEnhanceEnabled: boolean;
    setIsImageEnhanceEnabled: (enabled: boolean) => void;
}

export default function ConfigPanel({
    model,
    setModel,
    aspectRatio,
    setAspectRatio,
    isAIEnabled,
    setIsAIEnabled,
    isImageEnhanceEnabled,
    setIsImageEnhanceEnabled,
}: ConfigPanelProps) {
    const models = [
        { id: "z-image-turbo", name: "Z-Image Turbo", description: "Fastest Integration (Default)" },
        { id: "nano-banana", name: "Nano Banana", description: "Standard Free Tier" },
        { id: "nbpro", name: "NanoBanana Pro", description: "REQUIRES PAID KEY" },

        { id: "img3", name: "Google Imagen 3", description: "High Quality" },
        { id: "img4", name: "Google Imagen 4", description: "Latest Google Model" },
        { id: "qwen", name: "Qwen 2.5", description: "Creative & Abstract" },
        { id: "flux-schnell", name: "Flux Schnell", description: "High Speed Flux" },
        { id: "lucid-origin", name: "Lucid Origin", description: "Photo-Realistic" },
        { id: "phoenix", name: "Phoenix", description: "Portrait Specialized" },
        { id: "sdxl", name: "SDXL", description: "Stable Diffusion XL" },
        { id: "sdxl-lite", name: "SDXL Lite", description: "Lightweight SDXL" },
    ];

    const ratios = [
        { id: "1:1", label: "Square" },
        { id: "16:9", label: "Landscape" },
        { id: "9:16", label: "Portrait" },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
            <div className="flex items-center justify-between pb-6 border-b">
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                        <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                        AI Enhancement
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Use OpenRouter for Prompt Refinement & Character Consistency
                    </p>
                </div>
                <button
                    onClick={() => setIsAIEnabled(!isAIEnabled)}
                    className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                        isAIEnabled ? "bg-blue-600" : "bg-gray-200"
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isAIEnabled ? "translate-x-5" : "translate-x-0"
                        )}
                    />
                </button>
            </div>

            <div className="flex items-center justify-between pb-6 border-b">
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                        Cloudinary Image Enhance
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Auto-improve color, contrast & clarity
                    </p>
                </div>
                <button
                    onClick={() => setIsImageEnhanceEnabled(!isImageEnhanceEnabled)}
                    className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                        isImageEnhanceEnabled ? "bg-indigo-600" : "bg-gray-200"
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isImageEnhanceEnabled ? "translate-x-5" : "translate-x-0"
                        )}
                    />
                </button>
            </div>

            <div>
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <Settings className="w-5 h-5 mr-2" />
                    Generation Settings
                </h3>

                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <div className="grid gap-3">
                        {models.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setModel(m.id)}
                                className={cn(
                                    "flex items-start p-3 text-left border rounded-lg transition-all",
                                    model === m.id
                                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                        : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                                )}
                            >
                                <Box className={cn("w-5 h-5 mt-0.5 mr-3", model === m.id ? "text-blue-600" : "text-gray-400")} />
                                <div>
                                    <div className={cn("font-medium text-sm", model === m.id ? "text-blue-900" : "text-gray-900")}>
                                        {m.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t pt-6">
                <label className="text-sm font-medium text-gray-700 mb-4 block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {ratios.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setAspectRatio(r.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 border rounded-lg transition-all",
                                aspectRatio === r.id
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                    : "border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600"
                            )}
                        >
                            <span className="text-sm">{r.id}</span>
                            <span className="text-[10px] text-gray-400 mt-1">{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
