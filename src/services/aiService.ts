import { GoogleGenAI, Type } from "@google/genai";

export async function generateOutreachMessage(
  businessType: string,
  offer: string,
  tone: string,
  leadName?: string,
  leadCategory?: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
    You are a world-class local business outreach expert. Your goal is to generate high-converting, personalized outreach messages for local businesses.
    
    Target Business: ${leadName || 'Local Business'}
    Category: ${leadCategory || 'N/A'}
    My Business: ${businessType}
    My Offer: ${offer}
    Desired Tone: ${tone}
    
    Requirements:
    1. Professional but friendly (max 4-5 sentences).
    2. Start with a personalized hook acknowledging their business.
    3. Focus on how you can help them grow or solve a specific local business problem.
    4. Clear, low-friction call to action (e.g., "Open to a 5-min chat next week?").
    5. Provide two versions: a Cold Outreach and a Follow-up.
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

export async function scoreLead(
  leadName: string,
  category: string,
  rating: number,
  reviews: number,
  businessType: string,
  offer: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
    You are a senior sales analyst. Analyze a local business from Google Maps and determine its potential as a lead.
    
    Business Name: ${leadName}
    Category: ${category}
    Rating: ${rating}
    Reviews: ${reviews}
    
    My Business: ${businessType}
    My Offer: ${offer}
    
    Task:
    1. Assign a lead score from 0 to 100.
    2. Provide a brief, punchy 1-sentence reasoning.
    
    Scoring Framework:
    - RELEVANCE (0-60 pts): How well does their category align with your offer?
    - GROWTH POTENTIAL (0-40 pts): Do they have low ratings/reviews (need help) or high ratings (good partner)?
    
    Output must be a JSON object with "score" (number) and "reasoning" (string).
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
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["score", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    throw error;
  }
}
