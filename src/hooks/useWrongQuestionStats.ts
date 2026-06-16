import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizAttempt, QuizQuestion, WrongQuestionStat } from '../types';
import { useAuth } from './useAuth';

export function useWrongQuestionStats() {
  const { currentUser } = useAuth();
  const [wrongQuestionStats, setWrongQuestionStats] = useState<WrongQuestionStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setWrongQuestionStats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, 'wrongQuestionStats'), where('userId', '==', currentUser.id));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(d => d.data() as WrongQuestionStat);
        data.sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
        setWrongQuestionStats(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading wrong question stats:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const activeWrongStats = useMemo(() => {
    return wrongQuestionStats.filter(stat => !stat.mastered);
  }, [wrongQuestionStats]);

  const recordAttemptStats = useCallback(async (attempt: QuizAttempt, questions: QuizQuestion[]) => {
    if (!currentUser) return;
    const questionById = new Map(questions.map(q => [q.id, q]));
    const now = new Date().toISOString();
    const missedIds = [...attempt.wrongQuestionIds, ...attempt.unansweredQuestionIds];

    await Promise.all(missedIds.map(async (questionId) => {
      const question = questionById.get(questionId);
      const id = `${currentUser.id}_${questionId}`;
      const ref = doc(db, 'wrongQuestionStats', id);
      const snap = await getDoc(ref);
      const previous = snap.exists() ? snap.data() as WrongQuestionStat : null;
      const next: WrongQuestionStat = {
        id,
        userId: currentUser.id,
        questionId,
        subjectId: question?.subjectId || attempt.subjectId,
        lessonId: question?.lessonId || attempt.lessonId,
        wrongCount: (previous?.wrongCount || 0) + 1,
        lastWrongAt: now,
        lastAttemptId: attempt.id,
        mastered: false,
      };
      await setDoc(ref, next);
    }));

    if (attempt.mode === 'wrong_review' && attempt.correctQuestionIds.length > 0) {
      await Promise.all(attempt.correctQuestionIds.map(async (questionId) => {
        const id = `${currentUser.id}_${questionId}`;
        const ref = doc(db, 'wrongQuestionStats', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const previous = snap.data() as WrongQuestionStat;
        await setDoc(ref, {
          ...previous,
          mastered: true,
          masteredAt: now,
          lastAttemptId: attempt.id,
        });
      }));
    }
  }, [currentUser]);

  const markMastered = useCallback(async (questionId: string) => {
    if (!currentUser) return;
    const id = `${currentUser.id}_${questionId}`;
    const ref = doc(db, 'wrongQuestionStats', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await setDoc(ref, {
      ...snap.data(),
      mastered: true,
      masteredAt: new Date().toISOString(),
    });
  }, [currentUser]);

  return {
    wrongQuestionStats,
    activeWrongStats,
    isLoading,
    recordAttemptStats,
    markMastered,
  };
}
