import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { loadPublicQuiz, submitPublicQuiz } from './server/publicQuiz';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
}
const ai = new GoogleGenAI({ apiKey });

// System instruction for the tutor
const SYSTEM_INSTRUCTION = 
  "Bạn là một Trợ lý Gia sư AI thân thiện, tận tâm và vui vẻ dành cho học sinh THCS trong ứng dụng học tập Kinetic Learning.\n" +
  "Nhiệm vụ của bạn là giải đáp các câu hỏi khoa học (Toán, Vật Lý, Hóa Học, Sinh Học) một cách dễ hiểu, trực quan, gần gũi nhất có thể.\n" +
  "Vui lòng tuân theo các quy tắc sau:\n" +
  "1. Luôn sử dụng ngôn ngữ Tiếng Việt, lịch sự, thân thiện và xưng hô là 'Thầy' hoặc 'AI Gia sư' và gọi học sinh là 'em'.\n" +
  "2. Trình bày thông tin rõ ràng bằng Markdown (dùng danh sách liệt kê, in đậm các ý quan trọng).\n" +
  "3. Tránh dùng các từ ngữ quá chuyên sâu hoặc hàn lâm mà học sinh THCS khó hiểu. Nếu dùng thuật ngữ, hãy giải thích ngắn gọn.\n" +
  "4. Đưa ra các ví dụ thực tế trong đời sống để học sinh dễ liên hệ (ví dụ: liên hệ phản ứng hóa học với nấu ăn, hoặc đạo hàm với chuyển động chạy bộ).\n" +
  "5. Kết thúc câu trả lời bằng một lời động viên ngắn gọn hoặc một câu hỏi mở gợi sự tò mò của học sinh.";

// API Endpoint for AI Tutor
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Map the custom ChatMessage format to Gemini's content format
    const contents = messages.map((m: any) => {
      // Standardize the role: 'user' or 'model'
      const role = m.sender === 'user' ? 'user' : 'model';
      return {
        role,
        parts: [{ text: m.text }]
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response from Gemini', 
      details: error.message || String(error) 
    });
  }
});

app.get('/api/public-quiz/:slug', async (req, res) => {
  try {
    const quiz = await loadPublicQuiz(req.params.slug);
    if (!quiz) {
      return res.status(404).json({ error: 'Link làm bài không tồn tại hoặc đã bị ẩn.' });
    }
    res.json(quiz);
  } catch (error: any) {
    console.error('Public quiz load error:', error);
    res.status(500).json({ error: 'Không thể tải đề kiểm tra public.', details: error.message });
  }
});

app.post('/api/public-quiz/:slug/submit', async (req, res) => {
  try {
    const result = await submitPublicQuiz(req.params.slug, req.body);
    if (!result) {
      return res.status(404).json({ error: 'Link làm bài không tồn tại hoặc đã bị ẩn.' });
    }
    res.json(result);
  } catch (error: any) {
    console.error('Public quiz submit error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Không thể lưu kết quả.' });
  }
});

app.post('/api/public-quiz/:slug', async (req, res) => {
  try {
    const result = await submitPublicQuiz(req.params.slug, req.body);
    if (!result) {
      return res.status(404).json({ error: 'Link làm bài không tồn tại hoặc đã bị ẩn.' });
    }
    res.json(result);
  } catch (error: any) {
    console.error('Public quiz submit error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Không thể lưu kết quả.' });
  }
});

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

if (!isProd) {
  // Development mode using Vite Dev Server as middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  console.log('Vite dev middleware attached.');
} else {
  // Production mode serving the static build output
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    // Let backend handle API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

function startServer(portToTry: number) {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${portToTry} in ${isProd ? 'production' : 'development'} mode`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${portToTry} is already in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(Number(port));
