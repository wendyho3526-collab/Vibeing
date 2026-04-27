import { GoogleGenerativeAI } from "@google/genai";

/**
 * Gemini API 服務
 * 用於處理智慧分組建議或其他 AI 功能
 */

// 懶載入客戶端，避免啟動時缺少 API KEY 報錯
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("找不到 GEMINI_API_KEY，請在 Secrets 中設定。");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * 範例功能：獲取分組名稱建議
 */
export async function getGroupNameSuggestions(count: number) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `請為 ${count} 個小組提供有創意且簡短的中文隊名（例如：破風手、領航者）。僅返回隊名，用逗號分隔。`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().split(',').map(s => s.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
}
