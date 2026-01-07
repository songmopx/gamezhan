
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFateInsight = async (result: string | number, mode: string, seed: number): Promise<string> => {
  try {
    const prompt = `The user just performed a random selection using a millisecond-based entropy engine.
    Mode: ${mode}
    Result: ${result}
    Entropy Seed (MS): ${seed}
    
    Provide a short, mysterious, and encouraging "Fate Insight" (one or two sentences) about this result. 
    Make it feel like a cosmic coincidence or a lucky sign. 
    Language: Chinese (Simplified).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "命运之轮已然转动。";
  } catch (error) {
    return "每一个随机的瞬间都是宇宙的低语。";
  }
};

export const getDivinationInterpretation = async (thought: string, guaName: string, lineName: string, binary: string): Promise<string> => {
  try {
    const prompt = `你是一位精通《周易》的易学大师。
    用户心中所想（问卜之事）："${thought}"
    所得卦象：${guaName}
    动爻：${lineName} (卦象二进制从上往下: ${binary})
    
    请结合卦象、爻辞以及用户所问之事，给出一个深刻、哲学且具有启发性的解读。
    字数在 150 字以内。
    语言：简体中文。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });

    return response.text || "卦象深奥，此时沉默即是启示。";
  } catch (error) {
    return "万物盈缩，皆有定数。请静待时机。";
  }
};
