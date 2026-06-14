import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useStudents } from './useStudents';
import { Task } from '../types';

export function useTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => doc.data() as Task);
      // Sort tasks: incomplete first, then by title
      loadedTasks.sort((a, b) => {
        if (a.completed === b.completed) {
          return a.title.localeCompare(b.title);
        }
        return a.completed ? 1 : -1;
      });
      setTasks(loadedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = useCallback(async (title: string, category: string, xpReward: number) => {
    if (!currentUser) return;
    const newTaskRef = doc(collection(db, 'tasks'));
    const newTask: Task = {
      id: newTaskRef.id,
      userId: currentUser.id,
      title,
      category,
      subInfo: 'Nhiệm vụ mới tạo',
      xpReward,
      completed: false,
    };
    await setDoc(newTaskRef, newTask);
  }, [currentUser]);

  const { updateStudentXP } = useStudents();

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !currentUser) return;

    const completed = !task.completed;
    const now = new Date();
    const completedTime = completed ? `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}` : undefined;
    
    const updatedTask = { ...task, completed, completedTime };
    await setDoc(doc(db, 'tasks', taskId), updatedTask);
    
    if (completed) {
      await updateStudentXP(currentUser.id, task.xpReward);
    } else {
      await updateStudentXP(currentUser.id, -task.xpReward); // remove xp if uncompleted
    }
  }, [tasks, currentUser, updateStudentXP]);

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  }, []);

  return {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    deleteTask,
  };
}
