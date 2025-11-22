import { GoogleGenAI } from "@google/genai";

// Helper to strip the data URL prefix to get raw base64
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

// Helper to get MIME type
const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/png';
};

/**
 * Analyzes an image using Gemini 3 Pro Preview.
 */
export const analyzeImageContent = async (imageBase64: string, customPrompt?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mimeType = getMimeType(imageBase64);
  const cleanBase64 = stripBase64Prefix(imageBase64);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: customPrompt || "Analyze this image in detail. Describe the subject's appearance, clothing, facial expression, and the setting. Also identify any historical anachronisms if present.",
          },
        ],
      },
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

/**
 * Edits or Generates a new image based on an input image and a text prompt using Gemini 2.5 Flash Image.
 * This covers both the "Time Travel" (generate new scene) and "Magic Edit" (modify existing) use cases.
 */
export const editImageContent = async (imageBase64: string, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mimeType = getMimeType(imageBase64);
  const cleanBase64 = stripBase64Prefix(imageBase64);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Generation failed:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};
