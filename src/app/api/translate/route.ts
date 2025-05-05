import { GoogleGenAI, createUserContent } from "@google/genai";
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    console.log(env);
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    // Get the image blob from the request
    const blob = await request.blob();
    
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    const base64 = btoa(binary);
    
    // Call Gemini API with the image and translation prompt
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: createUserContent([
        {
          inlineData: {
            data: base64,
            mimeType: blob.type || "image/png",
          }
        },
        {
          text: `
            Translate the English texts in the image to Vietnamese in the following JSON format:
            [
              {
                "text": <TEXT>,
                "translated_text": <TRANSLATED_TEXT>
              }
              ...
            ]
          `
        }
      ])
    });
    
    // Return the response
    return new Response(JSON.stringify({ result: response.text }), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error("Error translating image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to translate image content" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}