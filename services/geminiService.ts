import { GoogleGenAI, Type } from "@google/genai";
import { WeChatArticle, RedBookPost } from "../types";

// Helper to initialize client lazily
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Generates the structure for a WeChat Official Account article.
 * Returns a JSON object defining sections and image prompts.
 */
export const generateWeChatArticleStructure = async (
  topic: string,
  imageCount: number
): Promise<WeChatArticle> => {
  const ai = getAiClient();
  const prompt = `
    You are a professional WeChat Official Account (公众号) editor.
    Create a detailed, engaging article about the topic: "${topic}".
    
    Requirements:
    1. Structure the response strictly as JSON.
    2. The article must be suitable for copying into the WeChat editor.
    3. Use inline CSS styles for 'heading' types to make them look aesthetically pleasing (e.g., bottom borders, colored text, bolding). Use a professional color palette (e.g., #333 text, #007bff or #d9534f accents).
    4. Include exactly ${imageCount} places where an image should be inserted. Mark these as type "image_prompt".
    5. For "image_prompt", the content field must be a detailed English prompt describing the image to be generated.
    
    Response Schema:
    {
      "title": "A Catchy Title",
      "sections": [
        { "type": "heading", "content": "Section Title", "style": "font-size: 18px; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 20px; color: #333;" },
        { "type": "paragraph", "content": "Paragraph content...", "style": "font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 15px;" },
        { "type": "image_prompt", "content": "A high quality photo of...", "style": "" }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["heading", "paragraph", "image_prompt"] },
                content: { type: Type.STRING },
                style: { type: Type.STRING },
              },
              required: ["type", "content"],
            },
          },
        },
        required: ["title", "sections"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate article structure");
  }

  return JSON.parse(response.text) as WeChatArticle;
};

/**
 * Generates content for a Xiaohongshu (Red Book) post.
 */
export const generateRedBookPostContent = async (
  topic: string
): Promise<RedBookPost> => {
  const ai = getAiClient();
  const prompt = `
    You are a top Xiaohongshu (Little Red Book) influencer. 
    Create a viral post about: "${topic}".
    
    Requirements:
    1. Tone: Enthusiastic, authentic, emoji-heavy (use lots of emojis!).
    2. Format: Short paragraphs, bullet points.
    3. Include 3-5 distinct tags (hashtags).
    4. Generate exactly 4 distinct image prompts that would go well with this post (e.g., cover image, detail shots). These prompts must be in English.
    
    Response Schema:
    {
      "title": "Title with Emojis",
      "content": "Full post content...",
      "tags": ["#tag1", "#tag2"],
      "imagePrompts": ["prompt 1", "prompt 2", "prompt 3", "prompt 4"]
    }
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "content", "tags", "imagePrompts"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate Red Book content");
  }

  return JSON.parse(response.text) as RedBookPost;
};

/**
 * Generates a single image based on a prompt.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return a placeholder if generation fails to avoid crashing the UI
    return `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 10))}/800/600`;
  }
};