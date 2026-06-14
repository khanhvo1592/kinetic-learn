// ============================================================
// Kinetic Learning — Core TypeScript Interfaces
// ============================================================

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  lessonsCount: number;
  exercisesCount: number;
}

export interface LessonSection {
  title: string;
  content: string;
  type?: 'text' | 'video' | 'video_raw' | 'formula' | 'image' | 'audio';
}

export interface Lesson {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  chapter: string;
  progress: number;
  duration: string;
  lastStudied: string;
  iconBg: string;
  iconColor: string;
  iconName: string;
  videoUrl?: string;
  summary: string;
  formulaTitle?: string;
  formulas?: string[];
  sections: LessonSection[];
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: string;
  subInfo: string;
  xpReward: number;
  completed: boolean;
  completedTime?: string;
}

export interface QuizOption {
  key: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  num: string;
  lessonId?: string;
  subjectId?: string;
  question: string;
  options: QuizOption[];
  correctKey: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  username: string;
  avatar: string;
  xp: number;
  streak: number;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'suspended';
  email: string;
  createdAt: string;
  teacherId?: string;
  password?: string;
}

export interface Discussion {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface StudyNote {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  updatedAt: string;
}

// Quiz session state
export interface QuizSessionState {
  questions: QuizQuestion[];
  currentIdx: number;
  userAnswers: Record<string, string>;
  timeLeft: number;
  startTime: number;
  isFinished: boolean;
  score: number;
  correctCount: number;
  wrongCount: number;
  actualTimeTaken: number;
}

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  unlocked: boolean;
}

// Navigation screen types (for compatibility — pages use react-router)
export type ScreenName = 'home' | 'courses' | 'lesson' | 'quiz' | 'result' | 'solutions' | 'tasks' | 'profile';

// Utility: calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

// Utility: calculate badges
export function calculateBadges(student: Student, quizHistory?: { subjectId: string; score: number }[]): Badge[] {
  const badges: Badge[] = [
    {
      id: 'streak-week',
      name: 'Chăm Chỉ Tuần',
      icon: 'local_fire_department',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      description: 'Duy trì streak 7 ngày liên tục',
      unlocked: student.streak >= 7,
    },
    {
      id: 'chem-master',
      name: 'Thần Hóa Học',
      icon: 'science',
      color: '#00BCD4',
      bgColor: '#E0F7FA',
      description: 'Đạt điểm tuyệt đối môn Hóa Học',
      unlocked: quizHistory?.some(q => q.subjectId === 'chemistry' && q.score === 100) ?? false,
    },
    {
      id: 'math-star',
      name: 'Siêu Sao Toán',
      icon: 'calculate',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      description: 'Đạt điểm tuyệt đối môn Toán',
      unlocked: quizHistory?.some(q => q.subjectId === 'math' && q.score === 100) ?? false,
    },
    {
      id: 'scholar',
      name: 'Học Bá',
      icon: 'school',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      description: 'Đạt 5000 XP trở lên',
      unlocked: student.xp >= 5000,
    },
    {
      id: 'first-quiz',
      name: 'Thử Thách Đầu Tiên',
      icon: 'quiz',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      description: 'Hoàn thành bài quiz đầu tiên',
      unlocked: (quizHistory?.length ?? 0) > 0,
    },
  ];
  return badges;
}
