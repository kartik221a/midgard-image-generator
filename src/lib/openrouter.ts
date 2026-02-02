
import { Character } from "@/components/studio/CharacterManager";

// Models
const LLM_MODEL = "nousresearch/hermes-3-llama-3.1-405b";
const VLM_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free"; // Validated by User


/**
 * Analyzes an image to extract visual character details using a VLM.
 */
export async function analyzeImage(imageUrl: string): Promise<string> {
    try {
        // Use our internal proxy
        const response = await fetch("/api/openrouter/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: VLM_MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Describe the main character in this image in extreme detail. Focus ONLY on physical appearance: hair color/style, clothing (specific colors/types), facial features, and accessories. Keep it concise (e.g. 'Little girl with curly red hair wearing a blue hoodie and yellow rain boots'). Do not describe the background or action." },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 200,
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error("VLM Analysis Error:", data.error || response.statusText);
            return "";
        }

        const data = await response.json();
        const description = data.choices?.[0]?.message?.content || "";
        console.log("Visual Analysis Result:", description);
        return description;

    } catch (error) {
        console.error("VLM Error:", error);
        return "";
    }
}

/**
 * Enhances a prompt using LLM, optionally injecting visual consistency context.
 */
export async function enhancePrompt(
    rawPrompt: string,
    characters: any[],
    visualContext?: string
): Promise<string> {

    // Create character context string
    const charContext = characters.map(c => `${c.name}: ${c.description}`).join("\n");

    let systemPrompt = `You are a professional stable diffusion prompt engineer. 
    Rewrite the user's story segment into a detailed image generation prompt.
    Focus on: Art style (Digital Art, Storybook Style), Lighting, Camera Angle, and Scene Details.
    
    Characters defined:
    ${charContext}
    `;

    if (visualContext) {
        systemPrompt += `
        
        CRITICAL INSTRUCTION - CHARACTER CONSISTENCY:
        The main character has been visually established. You MUST strictly describe them according to this visual anchor:
        "${visualContext}"
        
        Ignore any conflicting clothing descriptions in the new prompt if they contradict this anchor (unless the story explicitly says they changed clothes).
        Ensure the character looks exactly like this description.
        `;
    }

    try {
        const response = await fetch("/api/openrouter/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Scene: ${rawPrompt}` }
                ]
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error("LLM Error:", data.error || response.statusText);
            return rawPrompt;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || rawPrompt;

    } catch (error) {
        console.error("Enhance Prompt Error:", error);
        return rawPrompt;
    }
}
