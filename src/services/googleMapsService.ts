import { Lead } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const googleMapsService = {
  searchLeads: async (keyword: string, location: string, page: number = 1): Promise<Partial<Lead>[]> => {
    try {
      const prompt = `Find 20 REAL local businesses for the keyword "${keyword}" in "${location}". 
      ${page > 1 ? `This is page ${page} of the search. Please find a different set of 20 businesses than the previous ones.` : ''}
      Use Google Maps to find actual existing businesses. 
      For each lead, provide their name, full address, phone number, website, rating, and total reviews.
      Return the data as a JSON array of objects.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [
            { googleMaps: {} }
          ],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      // Extract JSON from response text (it might be wrapped in markdown blocks)
      const text = response.text || '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      
      const leads = JSON.parse(jsonStr);
      return leads;
    } catch (error) {
      console.error("Error finding leads with Google Maps:", error);
      return [];
    }
  }
};
