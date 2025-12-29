
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIInterviewerResponse = async (role: string, chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: chatHistory.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: h.parts })),
      config: {
        systemInstruction: `You are an elite expert interviewer for the position of ${role}. 
        Your goal is to conduct a professional, challenging, yet encouraging mock interview.
        Ask one question at a time.
        Evaluate the candidate's previous response briefly in your mind to decide if you need to ask a follow-up or move to a new topic.
        Topics: Introduction, Behavioral, Technical skills related to ${role}, Problem-solving.
        Keep your spoken parts concise.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Interviewer Error:", error);
    return "I'm sorry, I'm having trouble processing that. Could you please repeat or elaborate?";
  }
};

export const generateFinalScorecard = async (role: string, transcript: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a detailed scorecard for an interview for the role: ${role}. Here is the transcript: ${transcript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            scores: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                technical: { type: Type.NUMBER },
                structure: { type: Type.NUMBER },
                depth: { type: Type.NUMBER },
              },
              required: ["communication", "confidence", "technical", "structure", "depth"]
            }
          },
          required: ["overallScore", "strengths", "weaknesses", "improvementPlan", "scores"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Scorecard Generation Error:", error);
    return null;
  }
};
