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
    You are a world-class Instagram outreach expert and conversion copywriter. Your goal is to generate high-converting, personalized DMs that feel authentic and human.
    
    Target Lead: ${leadName || 'Prospect'}
    Lead Bio Context: ${leadBio || 'N/A'}
    My Business: ${businessType}
    My Offer: ${offer}
    Desired Tone: ${tone}
    
    Requirements:
    1. Short and punchy (Instagram DM style, max 3-4 sentences).
    2. Start with a highly personalized hook based on their bio or interests if available.
    3. Use emojis naturally but sparingly (max 2-3).
    4. Focus on the transformation/value for THEM, not your features.
    5. Clear, low-friction call to action (e.g., "Open to a quick chat?", "Mind if I send over a 1-min video explaining how?").
    6. Avoid corporate jargon or "salesy" language.
    7. Provide two versions: a Cold DM (initial contact) and a Follow-up (sent 3 days later).
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
  leadUsername: string,
  leadBio: string,
  followers: number,
  businessType: string,
  offer: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
    You are a senior sales analyst and lead qualification expert. Your task is to analyze an Instagram profile and determine its potential as a high-quality lead for a specific business.
    
    Lead Username: @${leadUsername}
    Lead Bio: ${leadBio}
    Followers: ${followers}
    
    My Business: ${businessType}
    My Offer: ${offer}
    
    Task:
    1. Assign a lead score from 0 to 100.
    2. Provide a brief, punchy 1-sentence reasoning for the score.
    
    Scoring Criteria:
    - Relevance (0-50 pts): Does their bio indicate they are in the target audience? Do they have a need for the offer?
    - Authority/Reach (0-30 pts): Does their follower count or bio suggest they are an influencer, business owner, or decision-maker?
    - Engagement Potential (0-20 pts): Does their bio feel active or approachable?
    
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
