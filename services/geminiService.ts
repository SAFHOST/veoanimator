
import { GoogleGenAI } from "@google/genai";
import { GlobalWindow, AspectRatio, Resolution } from "../types";
import { store } from "./store";

// Helper to handle the AI Studio API key selection flow
export const ensureApiKey = async (): Promise<boolean> => {
  const win = window as unknown as GlobalWindow;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
      // Assume success after dialog interaction as per instructions
      return true;
    }
    return true;
  }
  // Fallback for local development or environments without the specific window object
  // In a real app, this might show an error or a different input method.
  return !!process.env.API_KEY;
};

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64String,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateVeoVideo = async (
  imageFile: File,
  aspectRatio: AspectRatio,
  resolution: Resolution,
  prompt?: string,
  onStatusUpdate?: (status: string) => void
): Promise<string> => {
  try {
    // 1. Check for Admin Configured Key
    const settings = store.getSettings();
    const adminVeoConfig = settings.apiKeys.veo;
    
    let apiKeyToUse: string | undefined = process.env.API_KEY;
    let usingAdminKey = false;

    if (adminVeoConfig.enabled && adminVeoConfig.key && adminVeoConfig.key.trim() !== '') {
        apiKeyToUse = adminVeoConfig.key;
        usingAdminKey = true;
    } else {
        // 2. Fallback to User Key / Environment Key
        const keyReady = await ensureApiKey();
        if (!keyReady) {
          throw new Error("API Key selection failed or cancelled.");
        }
        // process.env.API_KEY is populated by the environment/window injection after selection
        apiKeyToUse = process.env.API_KEY;
    }

    if (!apiKeyToUse) {
        throw new Error("No API Key available.");
    }

    // Always create a new instance to ensure we get the latest key
    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    if (onStatusUpdate) onStatusUpdate("Processing image...");
    const imagePart = await fileToGenerativePart(imageFile);

    if (onStatusUpdate) onStatusUpdate("Initializing video generation model...");

    // Veo generation call
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image naturally", 
      image: {
        imageBytes: imagePart.data,
        mimeType: imagePart.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: resolution, // '720p' or '1080p'
        aspectRatio: aspectRatio,
      }
    });

    if (onStatusUpdate) onStatusUpdate("Video generation in progress. This may take a minute...");
    
    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      if (onStatusUpdate) onStatusUpdate("Still dreaming up pixels...");
    }

    if (onStatusUpdate) onStatusUpdate("Finalizing video...");

    const generatedVideo = operation.response?.generatedVideos?.[0];
    
    if (!generatedVideo?.video?.uri) {
      throw new Error("No video URI returned from the model.");
    }

    const downloadLink = generatedVideo.video.uri;

    // Fetch the actual video blob
    if (onStatusUpdate) onStatusUpdate("Downloading video...");
    
    // Append the key used for generation
    const response = await fetch(`${downloadLink}&key=${apiKeyToUse}`);
    
    if (!response.ok) {
       // Check for specific error as per instructions
       if (response.status === 404 || response.statusText.includes("Requested entity was not found")) {
           // Only trigger key selection if we weren't forcing an admin key.
           if (!usingAdminKey) {
                const win = window as unknown as GlobalWindow;
                if (win.aistudio) {
                    await win.aistudio.openSelectKey();
                }
           }
           throw new Error("Session expired or invalid key. Please try again.");
       }
       throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Veo generation error:", error);
    // Handle the specific "Requested entity was not found" case if it bubbled up differently
    if (error.message && error.message.includes("Requested entity was not found")) {
         // Only trigger UI if not admin managed
         const settings = store.getSettings();
         if (!settings.apiKeys.veo.enabled) {
             const win = window as unknown as GlobalWindow;
             if (win.aistudio) {
                await win.aistudio.openSelectKey();
             }
         }
         throw new Error("Session expired or invalid key. Please try again.");
    }
    throw error;
  }
};