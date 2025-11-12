// Vercel Serverless Function
// 路径: /api/generate-summary.js

// 导入 Google AI SDK
// 注意：你需要在 package.json 中声明这个依赖
import { GoogleGenerativeAI } from "@google/generative-ai";

// 从 Vercel 的环境变量中安全地获取 API 密钥
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = "你是一位深刻的灵魂分析师和心理洞察专家。你的任务是基于用户提供的一系列哲学和心理测试答案，为他们撰写一份温暖、深刻且个性化的总结报告。请不要重复问题，而是综合所有答案，提炼出用户的核心特质、内在驱动力、他们与世界互动的方式，以及他们灵魂深处的向往。你的语言应充满智慧和同理心。";

// 这是 Vercel 处理请求的主函数
export default async function handler(req, res) {
  // 1. 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. 从前端获取 prompt
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 3. 配置并调用 Google AI
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-09-2025"
    });

    const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {
            temperature: 0.7,
            topK: 10,
        }
    });

    const response = result.response;
    const text = response.text();

    // 4. 将 AI 的总结返回给前端
    res.status(200).json({ summary: text });

  } catch (error) {
    // 5. 处理错误
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "调用 AI 失败", details: error.message });
  }
}