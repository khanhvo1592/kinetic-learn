// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// server/publicQuiz.ts
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
function getAdminDb() {
  if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp({
        credential: applicationDefault()
      });
    }
  }
  return getFirestore();
}
async function getPublishedExamBySlug(slug) {
  const db = getAdminDb();
  const snap = await db.collection("examTemplates").where("shareSlug", "==", slug).where("status", "==", "published").where("isPublic", "==", true).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}
async function getQuestions(questionIds) {
  const db = getAdminDb();
  const refs = questionIds.map((id) => db.collection("quizzes").doc(id));
  const docs = await db.getAll(...refs);
  const byId = new Map(docs.filter((doc) => doc.exists).map((doc) => [doc.id, doc.data()]));
  return questionIds.map((id) => byId.get(id)).filter(Boolean);
}
async function loadPublicQuiz(slug) {
  const exam = await getPublishedExamBySlug(slug);
  if (!exam) {
    return null;
  }
  const questionIds = Array.isArray(exam.data.questionIds) ? exam.data.questionIds : [];
  const questions = await getQuestions(questionIds);
  return {
    id: exam.id,
    title: exam.data.publicTitle || exam.data.title,
    durationSeconds: exam.data.durationSeconds || 15 * 60,
    requireName: exam.data.requireName !== false,
    questionCount: questions.length,
    questions: questions.map((q, index) => ({
      id: q.id,
      num: String(index + 1).padStart(2, "0"),
      question: q.question,
      options: q.options
    }))
  };
}
async function submitPublicQuiz(slug, body) {
  const exam = await getPublishedExamBySlug(slug);
  if (!exam) {
    return null;
  }
  const displayName = String(body?.displayName || "").trim();
  if (!displayName) {
    const error = new Error("Vui l\xF2ng nh\u1EADp t\xEAn tr\u01B0\u1EDBc khi n\u1ED9p b\xE0i.");
    error.statusCode = 400;
    throw error;
  }
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
  const questionIds = Array.isArray(exam.data.questionIds) ? exam.data.questionIds : [];
  const questions = await getQuestions(questionIds);
  const correctQuestionIds = questions.filter((q) => answers[q.id] === q.correctKey).map((q) => q.id);
  const unansweredQuestionIds = questions.filter((q) => !answers[q.id]).map((q) => q.id);
  const wrongQuestionIds = questions.filter((q) => answers[q.id] && answers[q.id] !== q.correctKey).map((q) => q.id);
  const totalQuestions = questions.length;
  const now = /* @__PURE__ */ new Date();
  const startedAt = typeof body?.startedAt === "string" ? body.startedAt : now.toISOString();
  const startedAtMs = Date.parse(startedAt);
  const durationSeconds = Number.isFinite(startedAtMs) ? Math.max(0, Math.floor((now.getTime() - startedAtMs) / 1e3)) : 0;
  const attempt = {
    id: `public-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    examId: exam.id,
    shareSlug: slug,
    displayName,
    ...body?.contact ? { contact: String(body.contact).trim() } : {},
    ...body?.className ? { className: String(body.className).trim() } : {},
    answers,
    score: totalQuestions > 0 ? Math.round(correctQuestionIds.length / totalQuestions * 10) : 0,
    totalQuestions,
    correctCount: correctQuestionIds.length,
    wrongCount: wrongQuestionIds.length,
    unansweredCount: unansweredQuestionIds.length,
    startedAt,
    submittedAt: now.toISOString(),
    durationSeconds,
    teacherId: exam.data.teacherId || exam.data.createdBy,
    createdBy: exam.data.createdBy
  };
  const db = getAdminDb();
  await db.collection("publicQuizAttempts").doc(attempt.id).set(attempt);
  return {
    attemptId: attempt.id,
    score: attempt.score,
    totalQuestions,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    unansweredCount: attempt.unansweredCount,
    durationSeconds
  };
}

// server.ts
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
app.get("/api/public-quiz/:slug", async (req, res) => {
  try {
    const quiz = await loadPublicQuiz(req.params.slug);
    if (!quiz) {
      return res.status(404).json({ error: "Link l\xE0m b\xE0i kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 b\u1ECB \u1EA9n." });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Public quiz load error:", error);
    res.status(500).json({ error: "Kh\xF4ng th\u1EC3 t\u1EA3i \u0111\u1EC1 ki\u1EC3m tra public.", details: error.message });
  }
});
app.post("/api/public-quiz/:slug/submit", async (req, res) => {
  try {
    const result = await submitPublicQuiz(req.params.slug, req.body);
    if (!result) {
      return res.status(404).json({ error: "Link l\xE0m b\xE0i kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 b\u1ECB \u1EA9n." });
    }
    res.json(result);
  } catch (error) {
    console.error("Public quiz submit error:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Kh\xF4ng th\u1EC3 l\u01B0u k\u1EBFt qu\u1EA3." });
  }
});
app.post("/api/public-quiz/:slug", async (req, res) => {
  try {
    const result = await submitPublicQuiz(req.params.slug, req.body);
    if (!result) {
      return res.status(404).json({ error: "Link l\xE0m b\xE0i kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 b\u1ECB \u1EA9n." });
    }
    res.json(result);
  } catch (error) {
    console.error("Public quiz submit error:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Kh\xF4ng th\u1EC3 l\u01B0u k\u1EBFt qu\u1EA3." });
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
function startServer(portToTry) {
  const server = app.listen(portToTry, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${portToTry} in ${isProd ? "production" : "development"} mode`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${portToTry} is already in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}
startServer(Number(port));
