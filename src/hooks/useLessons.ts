import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Lesson } from '../types';

export function useLessons() {
  const { lessons } = useAppContext();

  const getLessonById = useCallback((id: string): Lesson | undefined => {
    return lessons.find(l => l.id === id);
  }, [lessons]);

  const getLessonsBySubject = useCallback((subjectId: string): Lesson[] => {
    return lessons.filter(l => l.subjectId === subjectId);
  }, [lessons]);

  const getRecentLessons = useCallback((count: number = 5): Lesson[] => {
    // In a real app we would sort by lastStudied timestamp, 
    // but here we just return the first few from the list.
    return [...lessons].slice(0, count);
  }, [lessons]);

  return {
    lessons,
    getLessonById,
    getLessonsBySubject,
    getRecentLessons,
  };
}
