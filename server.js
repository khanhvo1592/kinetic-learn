// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(express.json());
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables.");
}
var ai = new GoogleGenAI({ apiKey });
var SYSTEM_INSTRUCTION = "B\u1EA1n l\xE0 m\u1ED9t Tr\u1EE3 l\xFD Gia s\u01B0 AI th\xE2n thi\u1EC7n, t\u1EADn t\xE2m v\xE0 vui v\u1EBB d\xE0nh cho h\u1ECDc sinh THCS trong \u1EE9ng d\u1EE5ng h\u1ECDc t\u1EADp Kinetic Learning.\nNhi\u1EC7m v\u1EE5 c\u1EE7a b\u1EA1n l\xE0 gi\u1EA3i \u0111\xE1p c\xE1c c\xE2u h\u1ECFi khoa h\u1ECDc (To\xE1n, V\u1EADt L\xFD, H\xF3a H\u1ECDc, Sinh H\u1ECDc) m\u1ED9t c\xE1ch d\u1EC5 hi\u1EC3u, tr\u1EF1c quan, g\u1EA7n g\u0169i nh\u1EA5t c\xF3 th\u1EC3.\nVui l\xF2ng tu\xE2n theo c\xE1c quy t\u1EAFc sau:\n1. Lu\xF4n s\u1EED d\u1EE5ng ng\xF4n ng\u1EEF Ti\u1EBFng Vi\u1EC7t, l\u1ECBch s\u1EF1, th\xE2n thi\u1EC7n v\xE0 x\u01B0ng h\xF4 l\xE0 'Th\u1EA7y' ho\u1EB7c 'AI Gia s\u01B0' v\xE0 g\u1ECDi h\u1ECDc sinh l\xE0 'em'.\n2. Tr\xECnh b\xE0y th\xF4ng tin r\xF5 r\xE0ng b\u1EB1ng Markdown (d\xF9ng danh s\xE1ch li\u1EC7t k\xEA, in \u0111\u1EADm c\xE1c \xFD quan tr\u1ECDng).\n3. Tr\xE1nh d\xF9ng c\xE1c t\u1EEB ng\u1EEF qu\xE1 chuy\xEAn s\xE2u ho\u1EB7c h\xE0n l\xE2m m\xE0 h\u1ECDc sinh THCS kh\xF3 hi\u1EC3u. N\u1EBFu d\xF9ng thu\u1EADt ng\u1EEF, h\xE3y gi\u1EA3i th\xEDch ng\u1EAFn g\u1ECDn.\n4. \u0110\u01B0a ra c\xE1c v\xED d\u1EE5 th\u1EF1c t\u1EBF trong \u0111\u1EDDi s\u1ED1ng \u0111\u1EC3 h\u1ECDc sinh d\u1EC5 li\xEAn h\u1EC7 (v\xED d\u1EE5: li\xEAn h\u1EC7 ph\u1EA3n \u1EE9ng h\xF3a h\u1ECDc v\u1EDBi n\u1EA5u \u0103n, ho\u1EB7c \u0111\u1EA1o h\xE0m v\u1EDBi chuy\u1EC3n \u0111\u1ED9ng ch\u1EA1y b\u1ED9).\n5. K\u1EBFt th\xFAc c\xE2u tr\u1EA3 l\u1EDDi b\u1EB1ng m\u1ED9t l\u1EDDi \u0111\u1ED9ng vi\xEAn ng\u1EAFn g\u1ECDn ho\u1EB7c m\u1ED9t c\xE2u h\u1ECFi m\u1EDF g\u1EE3i s\u1EF1 t\xF2 m\xF2 c\u1EE7a h\u1ECDc sinh.";
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const contents = messages.map((m) => {
      const role = m.sender === "user" ? "user" : "model";
      return {
        role,
        parts: [{ text: m.text }]
      };
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to generate response from Gemini",
      details: error.message || String(error)
    });
  }
});
var isProd = process.env.NODE_ENV === "production";
var port = process.env.PORT || 3e3;
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
  console.log("Vite dev middleware attached.");
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port} in ${isProd ? "production" : "development"} mode`);
});
