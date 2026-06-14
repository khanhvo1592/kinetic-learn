import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { QuizQuestion } from '../types';

export function useQuizzes() {
  const { quizzes } = useAppContext();

  const getQuizzesByLesson = useCallback((lessonId: string): QuizQuestion[] => {
    return quizzes.filter(q => q.lessonId === lessonId);
  }, [quizzes]);

  return {
    quizzes,
    getQuizzesByLesson,
  };
}
