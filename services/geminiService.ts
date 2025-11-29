import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const polishTextAI = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `You are an expert copy editor. Your task is to fix grammar, punctuation, and flow in the following text without changing its meaning or style excessively. Return ONLY the corrected text. Do not add markdown code blocks.

Text to polish:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini Polish Error:", error);
    throw error;
  }
};

export const summarizeTextAI = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Summarize the following text concisely into a single paragraph. Return ONLY the summary.

Text to summarize:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash for speed on simple tasks
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini Summarize Error:", error);
    throw error;
  }
};