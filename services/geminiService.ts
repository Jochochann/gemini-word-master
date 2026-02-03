
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Always use process.env.API_KEY directly for initialization as per guidelines.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askAboutWord = async (word: string, question: string, context?: string) => {
  const ai = getAIClient();
  const systemInstruction = `
    You are an expert English language tutor. 
    The user is studying the word: "${word}".
    ${context ? `Context/Translation: ${context}` : ''}
    Provide clear, concise, and helpful explanations. 
    Use examples, synonyms, or etymology if helpful.
    Answer in the same language as the user's question (Japanese or English).
  `;

  // Use ai.models.generateContent to query GenAI with both the model name and prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${question}`,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  // Access the .text property directly (do not call text()).
  return response.text;
};

export const streamAssistant = async function* (word: string, translation: string, history: {role: string, parts: any[]}[]) {
  const ai = getAIClient();
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an English tutor helping a student learn the word "${word}" (translated as "${translation}"). Be encouraging and educational.`,
    }
  });

  // Since we use the SDK's chat, we would need to pass history if needed.
  // For simplicity in this demo, we'll send the latest prompt.
  const lastMessage = history[history.length - 1]?.parts[0]?.text || `Explain "${word}" to me.`;
  
  const result = await chat.sendMessageStream({ message: lastMessage });
  
  for await (const chunk of result) {
    // Access the .text property on the response chunk (do not call text()).
    yield (chunk as GenerateContentResponse).text;
  }
};
