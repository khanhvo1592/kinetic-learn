import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExamTemplate } from '../types';
import { useAuth } from './useAuth';
import { useAppContext } from '../contexts/AppContext';

function stripUndefined<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as T;
}

export function useExamTemplates() {
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const { quizzes } = useAppContext();
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setExamTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const templatesRef = collection(db, 'examTemplates');
    const templatesQuery = isAdmin
      ? templatesRef
      : isTeacher
        ? query(templatesRef, where('createdBy', '==', currentUser.id))
        : query(templatesRef, where('status', '==', 'published'));

    const unsubscribe = onSnapshot(
      templatesQuery,
      (snap) => {
        const data = snap.docs.map(d => d.data() as ExamTemplate);
        data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setExamTemplates(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading exam templates:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAdmin, isTeacher]);

  const fallbackExam = useMemo<ExamTemplate | null>(() => {
    if (examTemplates.length > 0 || quizzes.length === 0) return null;
    const now = new Date().toISOString();
    const questionIds = quizzes.slice(0, Math.min(10, quizzes.length)).map(q => q.id);
    return {
      id: 'sample-exam',
      title: 'Kiểm tra tổng hợp mẫu',
      subjectId: undefined,
      lessonIds: [],
      questionIds,
      durationSeconds: 15 * 60,
      shuffleQuestions: false,
      shuffleOptions: false,
      status: 'published',
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
    };
  }, [examTemplates.length, quizzes]);

  const visibleExamTemplates = useMemo(() => {
    const list = fallbackExam ? [fallbackExam, ...examTemplates] : examTemplates;
    if (isAdmin || isTeacher) return list;
    return list.filter(exam => exam.status === 'published');
  }, [examTemplates, fallbackExam, isAdmin, isTeacher]);

  const publishedExamTemplates = useMemo(() => {
    return visibleExamTemplates.filter(exam => exam.status === 'published');
  }, [visibleExamTemplates]);

  const getExamById = useCallback((id: string) => {
    return visibleExamTemplates.find(exam => exam.id === id) || null;
  }, [visibleExamTemplates]);

  const saveExamTemplate = useCallback(async (exam: ExamTemplate) => {
    const now = new Date().toISOString();
    const shareSlug = exam.shareSlug || `${exam.id.replace(/^exam-/, '')}-${Math.random().toString(36).slice(2, 8)}`;
    const nextExam: ExamTemplate = {
      ...exam,
      isPublic: exam.status === 'published' ? (exam.isPublic ?? true) : (exam.isPublic ?? false),
      shareSlug: exam.status === 'published' ? shareSlug : exam.shareSlug,
      publicTitle: exam.publicTitle || exam.title,
      requireName: exam.requireName ?? true,
      teacherId: exam.teacherId || exam.createdBy,
      updatedAt: now,
    };
    await setDoc(doc(db, 'examTemplates', exam.id), stripUndefined(nextExam));
  }, []);

  const deleteExamTemplate = useCallback(async (id: string) => {
    if (id === 'sample-exam') return;
    await deleteDoc(doc(db, 'examTemplates', id));
  }, []);

  const seedSampleExam = useCallback(async () => {
    if (!currentUser || quizzes.length === 0) return null;
    const now = new Date().toISOString();
    const exam: ExamTemplate = {
      id: `exam-${Date.now()}`,
      title: 'Kiểm tra tổng hợp mẫu',
      subjectId: undefined,
      lessonIds: [],
      questionIds: quizzes.slice(0, Math.min(10, quizzes.length)).map(q => q.id),
      durationSeconds: 15 * 60,
      shuffleQuestions: false,
      shuffleOptions: false,
      status: 'published',
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
    };
    await saveExamTemplate(exam);
    return exam;
  }, [currentUser, quizzes, saveExamTemplate]);

  return {
    examTemplates: visibleExamTemplates,
    publishedExamTemplates,
    isLoading,
    getExamById,
    saveExamTemplate,
    deleteExamTemplate,
    seedSampleExam,
  };
}
