import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Student } from '../types';

export function useStudents() {
  const { allStudents, updateStudent } = useAppContext();

  const getLeaderboard = useCallback((): Student[] => {
    return [...allStudents]
      .filter(s => s.role !== 'admin' && s.status === 'active')
      .sort((a, b) => b.xp - a.xp);
  }, [allStudents]);

  const updateStudentXP = useCallback(async (id: string, delta: number) => {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    await updateStudent({ ...student, xp: Math.max(0, student.xp + delta) });
  }, [allStudents, updateStudent]);

  const updateStudentStreak = useCallback(async (id: string, delta: number) => {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    await updateStudent({ ...student, streak: Math.max(0, student.streak + delta) });
  }, [allStudents, updateStudent]);

  const suspendStudent = useCallback(async (id: string) => {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    await updateStudent({ ...student, status: 'suspended' });
  }, [allStudents, updateStudent]);

  const unsuspendStudent = useCallback(async (id: string) => {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    await updateStudent({ ...student, status: 'active' });
  }, [allStudents, updateStudent]);

  return {
    allStudents,
    getLeaderboard,
    updateStudentXP,
    updateStudentStreak,
    suspendStudent,
    unsuspendStudent,
  };
}
