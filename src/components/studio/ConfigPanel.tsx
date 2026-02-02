"use client";

import { Settings, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
    model: string;
    setModel: (model: string) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
}

export default function ConfigPanel({
    model,
    setModel,
    aspectRatio,
    setAspectRatio,
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
