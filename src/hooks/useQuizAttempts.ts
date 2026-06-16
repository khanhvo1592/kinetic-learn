import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizAttempt, QuizQuestion } from '../types';
import { useAuth } from './useAuth';

interface CreateAttemptInput {
  mode: QuizAttempt['mode'];
  questions: QuizQuestion[];
  answers: Record<string, string>;
  startedAt: number;
  lessonId?: string;
  examId?: string;
  subjectId?: string;
}

function buildAttempt(userId: string, input: CreateAttemptInput): QuizAttempt {
  const submittedAtDate = new Date();
  const correctQuestionIds = input.questions
    .filter(q => input.answers[q.id] === q.correctKey)
    .map(q => q.id);
  const unansweredQuestionIds = input.questions
    .filter(q => !input.answers[q.id])
    .map(q => q.id);
  const wrongQuestionIds = input.questions
    .filter(q => input.answers[q.id] && input.answers[q.id] !== q.correctKey)
    .map(q => q.id);
  const totalQuestions = input.questions.length;
  const correctCount = correctQuestionIds.length;

  return {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    mode: input.mode,
    lessonId: input.lessonId,
    examId: input.examId,
    subjectId: input.subjectId,
    questionIds: input.questions.map(q => q.id),
    answers: input.answers,
    correctQuestionIds,
    wrongQuestionIds,
    unansweredQuestionIds,
    score: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 10) : 0,
    totalQuestions,
    correctCount,
    wrongCount: wrongQuestionIds.length,
    startedAt: new Date(input.startedAt).toISOString(),
    submittedAt: submittedAtDate.toISOString(),
    durationSeconds: Math.max(0, Math.floor((submittedAtDate.getTime() - input.startedAt) / 1000)),
  };
}

export function useQuizAttempts() {
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const attemptsQuery = isAdmin || isTeacher
      ? collection(db, 'quizAttempts')
      : query(collection(db, 'quizAttempts'), where('userId', '==', currentUser.id));

    const unsubscribe = onSnapshot(
      attemptsQuery,
      (snap) => {
        const data = snap.docs.map(d => d.data() as QuizAttempt);
        data.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        setAttempts(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading quiz attempts:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAdmin, isTeacher]);

  const recentAttempts = useMemo(() => attempts.slice(0, 3), [attempts]);

  const createAttempt = useCallback(async (input: CreateAttemptInput) => {
    if (!currentUser) throw new Error('Bạn cần đăng nhập để lưu kết quả.');
    const attempt = buildAttempt(currentUser.id, input);
    await setDoc(doc(db, 'quizAttempts', attempt.id), attempt);
    return attempt;
  }, [currentUser]);

  const getAttemptById = useCallback(async (id: string) => {
    const cached = attempts.find(a => a.id === id);
    if (cached) return cached;
    const snap = await getDoc(doc(db, 'quizAttempts', id));
    return snap.exists() ? snap.data() as QuizAttempt : null;
  }, [attempts]);

  return {
    attempts,
    recentAttempts,
    isLoading,
    createAttempt,
    getAttemptById,
  };
}
