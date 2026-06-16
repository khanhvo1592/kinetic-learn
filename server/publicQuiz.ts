import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

type PublicQuizAnswerMap = Record<string, string>;

function getAdminDb() {
  if (!getApps().length) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      'kinetic-learning-backend';
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    }
  }

  return getFirestore();
}

async function getPublishedExamBySlug(slug: string) {
  const db = getAdminDb();
  const snap = await db
    .collection('examTemplates')
    .where('shareSlug', '==', slug)
    .where('status', '==', 'published')
    .where('isPublic', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}

async function getQuestions(questionIds: string[]) {
  const db = getAdminDb();
  const refs = questionIds.map(id => db.collection('quizzes').doc(id));
  const docs = await db.getAll(...refs);
  const byId = new Map(docs.filter(doc => doc.exists).map(doc => [doc.id, doc.data()!]));
  return questionIds
    .map(id => byId.get(id))
    .filter(Boolean);
}

export async function loadPublicQuiz(slug: string) {
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
    questions: questions.map((q: any, index) => ({
      id: q.id,
      num: String(index + 1).padStart(2, '0'),
      question: q.question,
      options: q.options,
    })),
  };
}

export async function submitPublicQuiz(slug: string, body: any) {
  const exam = await getPublishedExamBySlug(slug);
  if (!exam) {
    return null;
  }

  const displayName = String(body?.displayName || '').trim();
  if (!displayName) {
    const error = new Error('Vui lòng nhập tên trước khi nộp bài.');
    (error as any).statusCode = 400;
    throw error;
  }

  const answers: PublicQuizAnswerMap = body?.answers && typeof body.answers === 'object' ? body.answers : {};
  const questionIds = Array.isArray(exam.data.questionIds) ? exam.data.questionIds : [];
  const questions = await getQuestions(questionIds);
  const correctQuestionIds = questions
    .filter((q: any) => answers[q.id] === q.correctKey)
    .map((q: any) => q.id);
  const unansweredQuestionIds = questions
    .filter((q: any) => !answers[q.id])
    .map((q: any) => q.id);
  const wrongQuestionIds = questions
    .filter((q: any) => answers[q.id] && answers[q.id] !== q.correctKey)
    .map((q: any) => q.id);
  const totalQuestions = questions.length;
  const now = new Date();
  const startedAt = typeof body?.startedAt === 'string' ? body.startedAt : now.toISOString();
  const startedAtMs = Date.parse(startedAt);
  const durationSeconds = Number.isFinite(startedAtMs)
    ? Math.max(0, Math.floor((now.getTime() - startedAtMs) / 1000))
    : 0;

  const attempt = {
    id: `public-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    examId: exam.id,
    shareSlug: slug,
    displayName,
    ...(body?.contact ? { contact: String(body.contact).trim() } : {}),
    ...(body?.className ? { className: String(body.className).trim() } : {}),
    answers,
    score: totalQuestions > 0 ? Math.round((correctQuestionIds.length / totalQuestions) * 10) : 0,
    totalQuestions,
    correctCount: correctQuestionIds.length,
    wrongCount: wrongQuestionIds.length,
    unansweredCount: unansweredQuestionIds.length,
    startedAt,
    submittedAt: now.toISOString(),
    durationSeconds,
    teacherId: exam.data.teacherId || exam.data.createdBy,
    createdBy: exam.data.createdBy,
  };

  const db = getAdminDb();
  await db.collection('publicQuizAttempts').doc(attempt.id).set(attempt);

  return {
    attemptId: attempt.id,
    score: attempt.score,
    totalQuestions,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    unansweredCount: attempt.unansweredCount,
    durationSeconds,
  };
}
