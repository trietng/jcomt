import { GoogleGenAI, Type, createUserContent } from "@google/genai";
import { getRequestContext } from '@cloudflare/next-on-pages';
import { Word } from "@/lib/common/model";

export const runtime = 'edge';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  let { env } = getRequestContext();

  const { slug } = await params

  // If no word name is provided, return an error
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Word name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Find the word by its primary key (word)
    let word = await env.DB.prepare("SELECT * FROM Word WHERE word = ?").bind(slug).first<Word>();

    // If not exists, open LLM client and fetch a definition
    // Technically a dictionary API should be more efficient and less expensive, but
    // an LLM has the advantage of being more up to date
    if (!word) {
      try {
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: `Find a definition no longer than 50 words of the word '${slug}'.`
        });
        if (response.text) {
          word = {
            word: slug,
            definition: response.text
          }
          // D1 does not support transactions, so YOLO and don't worry
          await env.DB.prepare("INSERT INTO Word (word, definition) VALUES (?, ?)").bind(word.word, word.definition).run();
        }
      } catch (_) {
        // suppressed error
      }
    }

    // If word not found, return 404. Something went horribly wrong.
    if (!word) {
      return new Response(JSON.stringify({ error: 'Word not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the word data
    return new Response(JSON.stringify(word), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch word:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch word' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}