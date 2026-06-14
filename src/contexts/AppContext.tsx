import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Lesson, QuizQuestion, Student } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load all data from Firestore
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);

    try {
      // Load subjects
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      let loadedSubjects = subjectsSnap.docs.map(d => d.data() as Subject);

      // Seed if empty (admin auto-seeds)
      if (loadedSubjects.length === 0) {
        for (const s of SUBJECTS) {
          await setDoc(doc(db, 'subjects', s.id), s);
        }
        loadedSubjects = SUBJECTS;
      }
      setSubjects(loadedSubjects);

      // Load lessons
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      let loadedLessons = lessonsSnap.docs.map(d => d.data() as Lesson);

      if (loadedLessons.length === 0) {
        const allLessons = [...RECENT_LESSONS, ...CHEMISTRY_LESSONS];
        for (const l of allLessons) {
          await setDoc(doc(db, 'lessons', l.id), l);
        }
        loadedLessons = allLessons;
      }
      setLessons(loadedLessons);

      // Load quizzes
      const quizzesSnap = await getDocs(collection(db, 'quizzes'));
      let loadedQuizzes = quizzesSnap.docs.map(d => d.data() as QuizQuestion);

      if (loadedQuizzes.length === 0) {
        for (const q of ATOM_QUIZ_QUESTIONS) {
          await setDoc(doc(db, 'quizzes', q.id), q);
        }
        loadedQuizzes = ATOM_QUIZ_QUESTIONS;
      }
      setQuizzes(loadedQuizzes);

      // Load students
      const studentsSnap = await getDocs(collection(db, 'students'));
      let loadedStudents = studentsSnap.docs.map(d => d.data() as Student);

      if (loadedStudents.length <= 1) {
        // Seed mock students for leaderboard (only if no other students exist)
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

    } catch (error) {
      console.error('Error loading data from Firestore:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser]);

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
    await setDoc(doc(db, 'lessons', lesson.id), lesson);
    refreshAll();
  }, [refreshAll]);

  const deleteLesson = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'lessons', id));
    refreshAll();
  }, [refreshAll]);

  const updateLesson = useCallback(async (lesson: Lesson) => {
    await setDoc(doc(db, 'lessons', lesson.id), lesson);
    refreshAll();
  }, [refreshAll]);


  const addQuiz = useCallback(async (quiz: QuizQuestion) => {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz);
    setQuizzes(prev => [...prev, quiz]);
    if (quiz.subjectId) {
      const subj = subjects.find(s => s.id === quiz.subjectId);
      if (subj) {
        const updated = { ...subj, exercisesCount: subj.exercisesCount + 1 };
        await setDoc(doc(db, 'subjects', subj.id), updated);
        setSubjects(prev => prev.map(s => s.id === subj.id ? updated : s));
      }
    }
  }, [subjects]);

  const updateQuiz = useCallback(async (quiz: QuizQuestion) => {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz);
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? quiz : q));
  }, []);

  const deleteQuiz = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'quizzes', id));
    setQuizzes(prev => prev.filter(q => q.id !== id));
  }, []);


  const updateStudent = useCallback(async (student: Student) => {
    await setDoc(doc(db, 'students', student.id), student);
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
