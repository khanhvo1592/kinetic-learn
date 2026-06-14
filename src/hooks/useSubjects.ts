import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Subject, Lesson } from '../types';

export function useSubjects() {
  const { subjects, lessons } = useAppContext();

  const getSubjectById = useCallback((id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  }, [subjects]);

  const getSubjectLessons = useCallback((subjectId: string): Lesson[] => {
    return lessons.filter(l => l.subjectId === subjectId);
  }, [lessons]);

  return {
    subjects,
    getSubjectById,
    getSubjectLessons,
  };
}
