import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 路由：這是在伺服器端執行的，安全地使用 API Key
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { count } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "伺服器未設定 API KEY" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `請為 ${count} 個小組提供有創意且簡短的中文隊名（例如：破風手、領航者）。僅返回隊名，用逗號分隔。不要包含任何解釋。`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text().split(',').map(s => s.trim());
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "AI 服務暫時無法使用" });
    }
  });

  // Vite 中間件配置 (開發模式)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 預期在 production 模式下 dist 已建置
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`伺服器運行中：http://localhost:${PORT}`);
  });
}

startServer();
