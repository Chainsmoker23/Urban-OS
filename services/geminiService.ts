import { GoogleGenAI, Type } from "@google/genai";
import { UrbanAnalysisResponse } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCityQuery = async (query: string): Promise<UrbanAnalysisResponse> => {
  const ai = getClient();
  
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
    Act as an advanced urban AI operating system called 'CityOS'. 
    Analyze the following user query related to city infrastructure, technology, or sociology: "${query}".
    
    Provide a structured analysis containing:
    1. A futuristic, precise summary of the situation.
    2. 3 key insights or predictions.
    3. 5 relevant data metrics that would be visualized in a dashboard (e.g., Efficiency, Power Draw, Latency, Satisfaction).
    4. A sustainability score from 0-100.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyInsights: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              }
            },
            sustainabilityScore: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as UrbanAnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};