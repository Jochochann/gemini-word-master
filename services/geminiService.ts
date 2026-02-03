
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askAboutWord = async (word: string, question: string, context?: string) => {
  const ai = getAIClient();
  const systemInstruction = `
    You are an expert language tutor. 
    The user is studying the word or phrase: "${word}".
    ${context ? `Known Translation/Meaning: ${context}` : ''}
    Provide clear, concise, and helpful explanations. 
    If it's English, explain nuances and synonyms. 
    If it's Chinese/Taiwanese Mandarin, provide Pinyin or Zhuyin, and explain character usage.
    Answer in the same language as the user's question (Japanese or English).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${question}`,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
};

export const streamAssistant = async function* (word: string, translation: string, history: {role: string, parts: any[]}[]) {
  const ai = getAIClient();
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a language tutor helping a student learn "${word}" ("${translation}"). Be encouraging, professional, and educational.`,
    }
  });

  const lastMessage = history[history.length - 1]?.parts[0]?.text || `Explain "${word}" to me.`;
  
  const result = await chat.sendMessageStream({ message: lastMessage });
  
  for await (const chunk of result) {
    yield (chunk as GenerateContentResponse).text;
  }
};
