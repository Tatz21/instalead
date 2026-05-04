import { Lead } from '../types';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const googleMapsService = {
  searchLeads: async (keyword: string, location: string, page: number = 1): Promise<Partial<Lead>[]> => {
    try {
      const prompt = `Find at least 20 REAL local businesses for the keyword "${keyword}" in "${location}". 
      ${page > 1 ? `This is page ${page} of the search. Please find a DIFFERENT set of 20 businesses than the previous ones. DO NOT repeat businesses.` : ''}
      Use the Google Maps tool to find actual existing businesses with their current details. 
      For each lead, provide:
      - name (string)
      - address (string, full address)
      - phoneNumber (string)
      - website (string, full URL)
      - rating (number)
      - userRatingsTotal (number)
      - category (string)
      
      Return the data as a JSON array of objects. Ensure you return as many results as possible (aim for 20).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [
            { googleMaps: {} }
          ],
          toolConfig: { includeServerSideToolInvocations: true },
        }
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error finding leads with Google Maps:", error);
      return [];
    }
  }
};
