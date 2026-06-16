import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Lesson, QuizQuestion, Student } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { SUBJECTS, RECENT_LESSONS, CHEMISTRY_LESSONS, ATOM_QUIZ_QUESTIONS, MOCK_STUDENTS } from '../lib/seed';

interface AppContextType {
  // Data
  subjects: Subject[];
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  allStudents: Student[];
  isDataLoading: boolean;

  // Refresh
  refreshAll: () => Promise<void>;

  // Admin CRUD
  addSubject: (subject: Subject) => Promise<void>;
  addLesson: (lesson: Lesson) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  addQuiz: (quiz: QuizQuestion) => Promise<void>;
  updateQuiz: (quiz: QuizQuestion) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  updateLesson: (lesson: Lesson) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function stripUndefined<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as T;
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const getScopedCollectionDocs = useCallback(async <T,>(
    collectionName: string,
    visibilityField: 'status' | null = 'status'
  ): Promise<T[]> => {
    const colRef = collection(db, collectionName);
    if (isAdmin) {
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as T);
    }

    if (isTeacher && currentUser) {
      const [createdSnap, assignedSnap] = await Promise.all([
        getDocs(query(colRef, where('createdBy', '==', currentUser.id))),
        getDocs(query(colRef, where('teacherId', '==', currentUser.id))),
      ]);
      const byId = new Map<string, T>();
      createdSnap.docs.forEach(d => byId.set(d.id, d.data() as T));
      assignedSnap.docs.forEach(d => byId.set(d.id, d.data() as T));
      return Array.from(byId.values());
    }

    if (visibilityField) {
      const snap = await getDocs(query(colRef, where(visibilityField, '==', 'published')));
      return snap.docs.map(d => d.data() as T);
    }

    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as T);
  }, [currentUser, isAdmin, isTeacher]);

  // Load all data from Firestore
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);

    try {
      // Load subjects
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      let loadedSubjects = subjectsSnap.docs.map(d => d.data() as Subject);

      // Seed if empty (admin auto-seeds)
      if (loadedSubjects.length === 0 && (isAdmin || isTeacher)) {
        for (const s of SUBJECTS) {
          await setDoc(doc(db, 'subjects', s.id), s);
        }
        loadedSubjects = SUBJECTS;
      } else if (loadedSubjects.length === 0) {
        loadedSubjects = SUBJECTS;
      }
      setSubjects(loadedSubjects);

      // Load lessons
      let loadedLessons = await getScopedCollectionDocs<Lesson>('lessons');

      if (loadedLessons.length === 0 && isAdmin) {
        const allLessons = [...RECENT_LESSONS, ...CHEMISTRY_LESSONS];
        for (const l of allLessons) {
          await setDoc(doc(db, 'lessons', l.id), l);
        }
        loadedLessons = allLessons;
      } else if (loadedLessons.length === 0) {
        loadedLessons = [...RECENT_LESSONS, ...CHEMISTRY_LESSONS];
      }
      setLessons(loadedLessons);

      // Load quizzes
      let loadedQuizzes = await getScopedCollectionDocs<QuizQuestion>('quizzes', null);

      if (loadedQuizzes.length === 0 && isAdmin) {
        for (const q of ATOM_QUIZ_QUESTIONS) {
          await setDoc(doc(db, 'quizzes', q.id), q);
        }
        loadedQuizzes = ATOM_QUIZ_QUESTIONS;
      } else if (loadedQuizzes.length === 0) {
        loadedQuizzes = ATOM_QUIZ_QUESTIONS;
      }
      setQuizzes(loadedQuizzes);

      // Load students. Students only need their own profile for the MVP;
      // admins/teachers can load the roster for management and reports.
      if (isAdmin || isTeacher) {
        const studentsQuery = isAdmin
          ? collection(db, 'students')
          : query(collection(db, 'students'), where('teacherId', '==', currentUser.id));
        const studentsSnap = await getDocs(studentsQuery);
        let loadedStudents = studentsSnap.docs.map(d => d.data() as Student);

        if (isAdmin && loadedStudents.length <= 1) {
          for (const s of MOCK_STUDENTS) {
            const existingDoc = await getDocs(collection(db, 'students'));
            const existingIds = existingDoc.docs.map(d => d.id);
            if (!existingIds.includes(s.id)) {
              await setDoc(doc(db, 'students', s.id), s);
            }
          }
          const refreshSnap = await getDocs(collection(db, 'students'));
          loadedStudents = refreshSnap.docs.map(d => d.data() as Student);
        }
        setAllStudents(loadedStudents);
      } else {
        setAllStudents(currentUser ? [currentUser] : []);
      }

    } catch (error) {
      console.error('Error loading data from Firestore:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser, getScopedCollectionDocs, isAdmin, isTeacher]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  const refreshAll = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const addSubject = useCallback(async (subject: Subject) => {
    await setDoc(doc(db, 'subjects', subject.id), subject);
    refreshAll();
  }, [refreshAll]);

  const deleteSubject = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'subjects', id));
    refreshAll();
  }, [refreshAll]);

  const addLesson = useCallback(async (lesson: Lesson) => {
    const now = new Date().toISOString();
    const ownerFields = currentUser ? {
      createdBy: lesson.createdBy || currentUser.id,
      teacherId: lesson.teacherId || currentUser.id,
      createdAt: lesson.createdAt || now,
      updatedAt: now,
      status: lesson.status || ('published' as const),
    } : {};
    await setDoc(doc(db, 'lessons', lesson.id), stripUndefined({ ...lesson, ...ownerFields }));
    refreshAll();
  }, [currentUser, refreshAll]);

  const deleteLesson = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'lessons', id));
    refreshAll();
  }, [refreshAll]);

  const updateLesson = useCallback(async (lesson: Lesson) => {
    await setDoc(doc(db, 'lessons', lesson.id), stripUndefined({ ...lesson, updatedAt: new Date().toISOString() }));
    refreshAll();
  }, [refreshAll]);


  const addQuiz = useCallback(async (quiz: QuizQuestion) => {
    const now = new Date().toISOString();
    const nextQuiz = {
      ...quiz,
      createdBy: quiz.createdBy || currentUser?.id,
      teacherId: quiz.teacherId || currentUser?.id,
      createdAt: quiz.createdAt || now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'quizzes', quiz.id), stripUndefined(nextQuiz));
    setQuizzes(prev => [...prev, nextQuiz]);
    if (quiz.subjectId) {
      const subj = subjects.find(s => s.id === quiz.subjectId);
      if (subj) {
        const updated = { ...subj, exercisesCount: subj.exercisesCount + 1 };
        await setDoc(doc(db, 'subjects', subj.id), updated);
        setSubjects(prev => prev.map(s => s.id === subj.id ? updated : s));
      }
    }
  }, [currentUser, subjects]);

  const updateQuiz = useCallback(async (quiz: QuizQuestion) => {
    const nextQuiz = { ...quiz, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'quizzes', quiz.id), stripUndefined(nextQuiz));
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? nextQuiz : q));
  }, []);

  const deleteQuiz = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'quizzes', id));
    setQuizzes(prev => prev.filter(q => q.id !== id));
  }, []);


  const updateStudent = useCallback(async (student: Student) => {
    await setDoc(doc(db, 'students', student.id), stripUndefined(student));
    setAllStudents(prev => prev.map(s => s.id === student.id ? student : s));
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
    setAllStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      subjects, lessons, quizzes, allStudents, isDataLoading,
      refreshAll, addSubject, addLesson, deleteSubject, deleteLesson, 
      addQuiz, updateQuiz, deleteQuiz, updateLesson, 
      updateStudent, deleteStudent,
    }}>
      {children}
    </AppContext.Provider>
  );
}
