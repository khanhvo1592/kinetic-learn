import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student } from '../types';
import { auth, db, loginWithGoogle, logoutUser, loginWithEmailPassword, registerWithEmailPassword } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const ADMIN_EMAIL = 'weblemyhotel@gmail.com';

interface AuthContextType {
  currentUser: Student | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Student, 'name' | 'username' | 'avatar'>>) => Promise<void>;
  syncXpStreak: (xp: number, streak: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

async function getOrCreateStudent(firebaseUser: FirebaseUser): Promise<Student> {
  const studentRef = doc(db, 'students', firebaseUser.uid);
  const snap = await getDoc(studentRef);

  if (snap.exists()) {
    const data = snap.data() as Student;
    // Auto-promote admin email
    if (firebaseUser.email === ADMIN_EMAIL && data.role !== 'admin') {
      const updated = { ...data, role: 'admin' as const };
      await setDoc(studentRef, updated);
      return updated;
    }
    return data;
  }

  // New user — create profile
  const newStudent: Student = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Học sinh mới',
    username: firebaseUser.email?.split('@')[0] || 'user',
    avatar: firebaseUser.photoURL || '',
    xp: 0,
    streak: 1,
    role: firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'student',
    status: 'active',
    email: firebaseUser.email || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  await setDoc(studentRef, newStudent);
  return newStudent;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubsSnapshot: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const student = await getOrCreateStudent(firebaseUser);
          if (student.status === 'suspended') {
            alert('Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.');
            await logoutUser();
            setCurrentUser(null);
          } else {
            setCurrentUser(student);
            // Sync in real-time
            unsubsSnapshot = onSnapshot(doc(db, 'students', firebaseUser.uid), (docSnap) => {
              if (docSnap.exists()) {
                const updatedStudent = docSnap.data() as Student;
                if (updatedStudent.status === 'suspended') {
                  alert('Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.');
                  logoutUser().then(() => setCurrentUser(null));
                } else {
                  setCurrentUser(updatedStudent);
                }
              }
            });
          }
        } catch (error: any) {
          console.error('Error loading user profile:', error);
          alert(`Lỗi kết nối CSDL: ${error.message || 'Vui lòng kiểm tra lại quyền (Rules) của Firestore'}`);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        if (unsubsSnapshot) {
          unsubsSnapshot();
          unsubsSnapshot = null;
        }
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubsSnapshot) unsubsSnapshot();
    };
  }, []);

  const login = useCallback(async () => {
    await loginWithGoogle();
    // onAuthStateChanged will handle setting the user
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    await loginWithEmailPassword(email, pass);
  }, []);

  const registerWithEmail = useCallback(async (email: string, pass: string) => {
    await registerWithEmailPassword(email, pass);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<Student, 'name' | 'username' | 'avatar'>>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    await setDoc(doc(db, 'students', currentUser.id), updated);
    setCurrentUser(updated);
  }, [currentUser]);

  const syncXpStreak = useCallback(async (xp: number, streak: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, xp, streak };
    await setDoc(doc(db, 'students', currentUser.id), updated);
    setCurrentUser(updated);
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAdmin, isTeacher, login, loginWithEmail, registerWithEmail, logout, updateProfile, syncXpStreak }}>
      {children}
    </AuthContext.Provider>
  );
}
