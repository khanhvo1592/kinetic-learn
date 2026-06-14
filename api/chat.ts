import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = 
  "Bạn là một Trợ lý Gia sư AI thân thiện, tận tâm và vui vẻ dành cho học sinh THCS trong ứng dụng học tập Kinetic Learning.\n" +
  "Nhiệm vụ của bạn là giải đáp các câu hỏi khoa học (Toán, Vật Lý, Hóa Học, Sinh Học) một cách dễ hiểu, trực quan, gần gũi nhất có thể.\n" +
  "Vui lòng tuân theo các quy tắc sau:\n" +
  "1. Luôn sử dụng ngôn ngữ Tiếng Việt, lịch sự, thân thiện và xưng hô là 'Thầy' hoặc 'AI Gia sư' và gọi học sinh là 'em'.\n" +
  "2. Trình bày thông tin rõ ràng bằng Markdown (dùng danh sách liệt kê, in đậm các ý quan trọng).\n" +
  "3. Tránh dùng các từ ngữ quá chuyên sâu hoặc hàn lâm mà học sinh THCS khó hiểu. Nếu dùng thuật ngữ, hãy giải thích ngắn gọn.\n" +
  "4. Đưa ra các ví dụ thực tế trong đời sống để học sinh dễ liên hệ (ví dụ: liên hệ phản ứng hóa học với nấu ăn, hoặc đạo hàm với chuyển động chạy bộ).\n" +
  "5. Kết thúc câu trả lời bằng một lời động viên ngắn gọn hoặc một câu hỏi mở gợi sự tò mò của học sinh.";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
      return res.status(500).json({ error: 'API key is missing on the server' });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // Map the custom ChatMessage format to Gemini's content format
    const contents = messages.map((m: any) => {
      const role = m.sender === 'user' ? 'user' : 'model';
      return {
        role,
        parts: [{ text: m.text }]
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    if (response.text) {
      res.status(200).json({ reply: response.text });
    } else {
      res.status(500).json({ error: 'Empty response from Gemini API' });
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
}
