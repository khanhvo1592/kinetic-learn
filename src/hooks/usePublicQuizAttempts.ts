import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PublicQuizAttempt } from '../types';
import { useAuth } from './useAuth';

export function usePublicQuizAttempts() {
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const [attempts, setAttempts] = useState<PublicQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || (!isAdmin && !isTeacher)) {
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const attemptsRef = collection(db, 'publicQuizAttempts');
    const attemptsQuery = isAdmin
      ? attemptsRef
      : query(attemptsRef, where('createdBy', '==', currentUser.id));

    const unsubscribe = onSnapshot(
      attemptsQuery,
      (snap) => {
        const data = snap.docs.map(d => d.data() as PublicQuizAttempt);
        data.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        setAttempts(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading public quiz attempts:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAdmin, isTeacher]);

  return { attempts, isLoading };
}
