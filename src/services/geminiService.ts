/**
 * Gemini API 服務
 * 現在改為透過後端伺服器 (server.ts) 進行呼叫
 * 這樣 API Key 就不會洩漏到前端瀏覽器
 */

export async function getGroupNameSuggestions(count: number) {
  try {
    const response = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count }),
    });

    if (!response.ok) {
      throw new Error("API 請求失敗");
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("呼叫 AI 服務時發生錯誤:", error);
    return [];
  }
}
