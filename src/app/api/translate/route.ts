import { GoogleGenAI, Type, createUserContent } from "@google/genai";
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    // Parse the FormData from the request
    const formData = await request.formData();
    
    // Get the image file from the form data
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: "Image file is required" }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Get optional parameters if any
    const targetLanguage = formData.get('targetLanguage')?.toString() || 'Vietnamese';
    
    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    const base64 = btoa(binary);
    
    // Call Gemini API with the image and translation prompt
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: createUserContent([
        {
          inlineData: {
            data: base64,
            mimeType: imageFile.type || "image/png",
          }
        },
        {
          text: `Translate the texts in the comic page to ${targetLanguage}. Keep newlines. Take into account the gender and age of the speakers and their possible relationships.`
        }
      ]),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              'text': {
                type: Type.STRING,
                description: 'Original text',
                nullable: false,
              },
              'translated_text': {
                type: Type.STRING,
                description: 'Translated text in all caps',
                nullable: false,
              },
              'box_2d': {
                type: Type.ARRAY,
                description: "Bounding box data of format [y_min, x_min, y_max, x_max]",
                nullable: false,
                items: {
                  type: Type.NUMBER,
                  nullable: false
                }
              }
            },
            required: ['text', 'translated_text', 'box_2d'],
          },
        },
      },
    });
    
    // Return the response
    return new Response(response.text, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(error);
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