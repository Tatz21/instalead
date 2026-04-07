import { GoogleGenAI, Type } from "@google/genai";

export async function generateOutreachMessage(
  businessType: string,
  offer: string,
  tone: string,
  leadName?: string,
  leadBio?: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
    Generate a highly personalized Instagram outreach message.
    
    Target Lead: ${leadName || 'Prospect'}
    Lead Bio Context: ${leadBio || 'N/A'}
    My Business: ${businessType}
    My Offer: ${offer}
    Desired Tone: ${tone}
    
    Requirements:
    1. Keep it short and punchy (Instagram DM style).
    2. Use emojis naturally.
    3. Include a clear call to action.
    4. Provide two versions: a Cold DM and a Follow-up.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cold_dm: { type: Type.STRING },
            follow_up: { type: Type.STRING }
          },
          required: ["cold_dm", "follow_up"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
