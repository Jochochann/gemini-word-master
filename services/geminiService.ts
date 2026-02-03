
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const getAIClient = () => {
  // Always create a new instance right before making an API call 
  // to ensure it uses the most up-to-date API key from the dialog.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askAboutWord = async (word: string, question: string, translation?: string) => {
  const ai = getAIClient();
  const systemInstruction = `
    あなたは親切で優秀な語学講師です。
    ユーザーは現在、以下の単語/フレーズを学習しています: "${word}"
    ${translation ? `提示されている意味: ${translation}` : ''}
    
    【回答ルール】
    1. 必ず日本語で回答してください。
    2. 解説は簡潔かつ明快に行ってください。
    3. 英単語の場合は、日本人が間違いやすいニュアンスの違いや、類義語との使い分けに重点を置いてください。
    4. 中国語（台湾華語）の場合は、ピンインや注音を添え、漢字の意味や日常会話での使われ方を説明してください。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: question }] }],
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
};

export const streamAssistantResponse = async function* (word: string, translation: string, question: string) {
  const ai = getAIClient();
  const systemInstruction = `
    あなたはプロの語学講師です。生徒が「${word}」（意味: ${translation}）を学習するのを手伝ってください。
    回答は必ず【日本語】で行ってください。
    日本人の学習者が直感的に理解できるように、語源、文化的な背景、あるいは類義語との比較を交えて解説してください。
  `;

  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: question }] }],
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  for await (const chunk of stream) {
    const text = (chunk as GenerateContentResponse).text;
    if (text) yield text;
  }
};
