import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuizzes } from './useQuizzes';

export function useQuizSession(lessonId?: string) {
  const { getQuizzesByLesson, quizzes: allQuizzes } = useQuizzes();
  
  // Get questions (filter if lessonId provided)
  const questions = useMemo(() => {
    return lessonId ? getQuizzesByLesson(lessonId) : allQuizzes;
  }, [lessonId, getQuizzesByLesson, allQuizzes]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [actualTimeTaken, setActualTimeTaken] = useState(0);

  // Timer effect
  useEffect(() => {
    if (isFinished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, questions.length]);

  const selectAnswer = useCallback((questionId: string, key: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: key,
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  }, [currentIdx, questions.length]);

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    setActualTimeTaken(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime]);

  const resetQuiz = useCallback(() => {
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeLeft(900);
    setIsFinished(false);
    setActualTimeTaken(0);
  }, []);

  // Calculate results
  const correctCount = useMemo(() => {
    return questions.filter(q => userAnswers[q.id] === q.correctKey).length;
  }, [questions, userAnswers]);

  const wrongCount = useMemo(() => {
    return Object.keys(userAnswers).length - correctCount;
  }, [userAnswers, correctCount]);

  const score = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((correctCount / questions.length) * 10);
  }, [correctCount, questions.length]);

  return {
    questions,
    currentIdx,
    timeLeft,
    userAnswers,
    isFinished,
    score,
    correctCount,
    wrongCount,
    actualTimeTaken,
    selectAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
  };
}
