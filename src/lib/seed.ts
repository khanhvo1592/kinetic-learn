// ============================================================
// Seed Data — Used for initial Firestore seeding
// These are the same data from the original data.ts, now used only as seed templates.
// ============================================================

import { Subject, Lesson, Task, QuizQuestion, Student } from '../types';

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Toán', icon: 'calculate', color: '#2196F3', bgColor: '#E3F2FD', borderColor: 'border-b-[#2196F3]/30', lessonsCount: 124, exercisesCount: 45 },
  { id: 'literature', name: 'Ngữ Văn', icon: 'menu_book', color: '#9C27B0', bgColor: '#F3E5F5', borderColor: 'border-b-[#9C27B0]/30', lessonsCount: 98, exercisesCount: 30 },
  { id: 'english', name: 'Tiếng Anh', icon: 'translate', color: '#FF9800', bgColor: '#FFF3E0', borderColor: 'border-b-[#FF9800]/30', lessonsCount: 156, exercisesCount: 82 },
  { id: 'physics', name: 'Vật Lý', icon: 'bolt', color: '#4CAF50', bgColor: '#E8F5E9', borderColor: 'border-b-[#4CAF50]/30', lessonsCount: 75, exercisesCount: 25 },
  { id: 'chemistry', name: 'Hóa Học', icon: 'science', color: '#00BCD4', bgColor: '#E0F7FA', borderColor: 'border-b-[#00BCD4]/30', lessonsCount: 82, exercisesCount: 35 },
  { id: 'biology', name: 'Sinh Học', icon: 'eco', color: '#FF5722', bgColor: '#FBE9E7', borderColor: 'border-b-[#FF5722]/30', lessonsCount: 64, exercisesCount: 20 },
];

export const RECENT_LESSONS: Lesson[] = [
  {
    id: 'math-derivative', subjectId: 'math', subjectName: 'Toán học', title: 'Toán - Đạo hàm',
    chapter: 'Chương 5: Phép tính vi phân', progress: 85, duration: '25 phút', lastStudied: '12 phút trước',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600', iconName: 'functions',
    summary: 'Giới thiệu về khái niệm đạo hàm, các quy tắc tính đạo hàm căn bản và ý nghĩa hình học của đạo hàm tại một điểm.',
    sections: [
      { title: '1. Khái niệm đạo hàm', content: 'Đạo hàm của hàm số y=f(x) tại điểm x_0 biểu thị tốc độ thay đổi của hàm số tại điểm đó.' },
      { title: '2. Các công thức sơ cấp', content: 'Đạo hàm của x^n bằng n*x^(n-1). Đạo hàm của hằng số bằng 0.' }
    ]
  },
  {
    id: 'physics-optics', subjectId: 'physics', subjectName: 'Vật lý', title: 'Quang học cơ bản',
    chapter: 'Chương 4: Khúc xạ ánh sáng', progress: 40, duration: '30 phút', lastStudied: '2 giờ trước',
    iconBg: 'bg-purple-100', iconColor: 'text-purple-600', iconName: 'science',
    summary: 'Bài học nền tảng về hiện tượng phản xạ, khúc xạ ánh sáng và nguyên lý truyền thẳng của các tia sáng trong môi trường đồng tính.',
    sections: [
      { title: '1. Hiện tượng khúc xạ', content: 'Khi tia sáng đi từ môi trường trong suốt này sang môi trường trong suốt khác sẽ bị lệch hướng ở mặt phân cách.' },
      { title: '2. Định luật khúc xạ', content: 'Tỉ số giữa sin góc tới và sin góc khúc xạ là hằng số đối với hai môi trường trong suốt nhất định.' }
    ]
  },
  {
    id: 'english-present-perfect', subjectId: 'english', subjectName: 'Tiếng Anh', title: 'Present Perfect',
    chapter: 'Grammar Unit 3: Các thì hiện tại', progress: 65, duration: '18 phút', lastStudied: 'Hôm qua',
    iconBg: 'bg-orange-100', iconColor: 'text-orange-600', iconName: 'language',
    summary: 'Hướng dẫn sử dụng thì Hiện tại Hoàn thành (Present Perfect Tense) để nói về sự kiện đã xảy ra kéo dài đến hiện tại hoặc vừa mới kết thúc.',
    sections: [
      { title: '1. Cấu trúc câu', content: 'Công thức: S + have / has + V3/ed. Ví dụ: I have studied chemistry for 3 years.' },
      { title: '2. Cách sử dụng phổ biến', content: 'Dùng để chỉ hành động đã xảy ra trong quá khứ nhưng để lại kết quả ở hiện tại, hoặc trải nghiệm bản thân.' }
    ]
  }
];

export const CHEMISTRY_LESSONS: Lesson[] = [
  {
    id: 'chem-atoms', subjectId: 'chemistry', subjectName: 'Hóa học 8', title: 'Bài 1: Cấu tạo nguyên tử',
    chapter: 'Chương 1: Thành phần chất', progress: 80, duration: '20 phút', lastStudied: 'Hôm nay',
    iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', iconName: 'science',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-molecule-with-nucleus-rotating-in-a-lab-41312-large.mp4',
    summary: 'Nguyên tử là hạt vô cùng nhỏ, trung hòa về điện, cấu tạo nên các chất. Mọi vật thể quanh ta đều được cấu thành từ hàng tỉ tỉ nguyên tử.',
    formulaTitle: 'CÔNG THỨC CẦN NHỚ',
    formulas: ['Số p = Số e', 'm_nt ≈ m_p + m_n'],
    sections: [
      { title: '1. Khái niệm nguyên tử', content: 'Nguyên tử là hạt vô cùng nhỏ, trung hòa về điện, cấu tạo nên các chất. Mọi vật thể quanh ta đều được cấu thành từ hàng tỉ tỉ nguyên tử cấu tụ với nhau.' },
      { title: '2. Cấu tạo chi tiết', content: 'Nguyên tử gồm 2 phần chính:\n\n- Hạt nhân (Nucleus): Nằm ở tâm, gồm hạt proton mang điện tích dương (+) và hạt nơtron không mang điện.\n\n- Lớp vỏ (Shell): Gồm các hạt electron mang điện tích âm (-) chuyển động cực nhanh xung quanh hạt nhân và sắp xếp theo từng lớp.' },
      { title: '3. Khối lượng nguyên tử', content: 'Vì khối lượng của hạt nhân lớn hơn rất nhiều so với vỏ eletron (khối lượng hạt e là không đáng kể, xấp xỉ 1/1836 khối lượng proton), do đó khối lượng nguyên tử hầu như tập trung toàn bộ ở hạt nhân.' }
    ]
  },
  {
    id: 'chem-elements', subjectId: 'chemistry', subjectName: 'Hóa học 8', title: 'Bài 2: Nguyên tố hóa học',
    chapter: 'Chương 1: Thành phần chất', progress: 0, duration: '15 phút', lastStudied: 'Chưa học',
    iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', iconName: 'hub',
    summary: 'Nguyên tố hóa học là tập hợp những nguyên tử cùng loại, có cùng số proton trong hạt nhân. Số proton là đặc trưng quan trọng nhất.',
    sections: [
      { title: '1. Khái niệm nguyên tố', content: 'Tập hợp các nguyên tử có cùng điện tích hạt nhân (cùng số proton).' },
      { title: '2. Kí hiệu hóa học', content: 'Biểu diễn nguyên tố bằng một hoặc hai chữ cái, chữ cái đầu viết hoa. Ví dụ: Hydrogen kí hiệu là H, Oxygen kí hiệu là O.' }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  { id: 'task-1', userId: '', title: 'Hoàn thành 10 câu trắc nghiệm Lý', category: 'Vật Lý', subInfo: 'Chương 3: Điện học • Thưởng 50xp', xpReward: 50, completed: false },
  { id: 'task-2', userId: '', title: 'Đọc chương 2 Sách Ngữ Văn', category: 'Ngữ Văn', subInfo: 'Đã hoàn thành lúc 08:30 • Thưởng 30xp', xpReward: 30, completed: true, completedTime: '08:30' },
  { id: 'task-3', userId: '', title: 'Ôn tập từ vựng Unit 5', category: 'Tiếng Anh', subInfo: 'Flashcards • Thưởng 20xp', xpReward: 20, completed: false },
];

export const ATOM_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1', num: '01', subjectId: 'physics',
    question: 'Hành tinh nào gần Mặt Trời nhất trong hệ Mặt Trời?',
    options: [{ key: 'A', text: 'Sao Thủy' }, { key: 'B', text: 'Sao Kim' }, { key: 'C', text: 'Trái Đất' }, { key: 'D', text: 'Sao Hỏa' }],
    correctKey: 'A', explanation: 'Sao Thủy (Mercury) là hành tinh nhỏ nhất và nằm gần Mặt Trời nhất trong Hệ Mặt Trời.',
  },
  {
    id: 'q2', num: '02', subjectId: 'chemistry',
    question: 'Nguyên tử mang điện tích gì?',
    options: [{ key: 'A', text: 'Điện tích dương' }, { key: 'B', text: 'Điện tích âm' }, { key: 'C', text: 'Trung hòa về điện' }, { key: 'D', text: 'Biến đổi liên tục' }],
    correctKey: 'C', explanation: 'Nguyên tử trung hòa về điện do có số proton mang điện tích dương (+) bằng chính xác số electron mang điện tích âm (-) lớp vỏ.',
  },
  {
    id: 'q3', num: '03', subjectId: 'chemistry',
    question: 'Nguyên tố nào có ký hiệu hóa học là O?',
    options: [{ key: 'A', text: 'Oxy' }, { key: 'B', text: 'Hydro' }, { key: 'C', text: 'Nitơ' }, { key: 'D', text: 'Sắt' }],
    correctKey: 'A', explanation: 'Ký hiệu hóa học O là viết tắt của Oxygen trong tiếng Anh (Oxy).',
  },
  {
    id: 'q4', num: '04', subjectId: 'chemistry',
    question: 'Hạt nào nằm trong hạt nhân nguyên tử mà không mang điện?',
    options: [{ key: 'A', text: 'Proton' }, { key: 'B', text: 'Nơtron' }, { key: 'C', text: 'Electron' }, { key: 'D', text: 'Hạt nhân' }],
    correctKey: 'B', explanation: 'Hạt nhân nguyên tử cấu tạo từ Proton (+) và Nơtron (không mang điện).',
  },
  {
    id: 'q5', num: '05', subjectId: 'chemistry',
    question: 'Điện tích của một proton là gì?',
    options: [{ key: 'A', text: 'Dương (+)' }, { key: 'B', text: 'Âm (-)' }, { key: 'C', text: 'Không mang điện' }, { key: 'D', text: 'Cả hai loại' }],
    correctKey: 'A', explanation: 'Hạt proton luôn mang điện tích quy ước là dương (+1).',
  }
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'mock-1', name: 'Khánh Linh', username: 'khanhlinh', email: 'linh.nguyen@kinetic.edu.vn', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=120', xp: 1520, streak: 8, role: 'student', status: 'active', createdAt: '2026-01-10' },
  { id: 'mock-2', name: 'Đức Huy', username: 'duchuy', email: 'huy.pham@kinetic.edu.vn', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', xp: 1380, streak: 5, role: 'student', status: 'active', createdAt: '2026-02-15' },
  { id: 'mock-3', name: 'Bảo Nam', username: 'baonam', email: 'nam.tran@kinetic.edu.vn', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', xp: 1100, streak: 0, role: 'student', status: 'active', createdAt: '2026-04-12' },
  { id: 'mock-4', name: 'Gia Bách', username: 'giabach', email: 'bach.do@kinetic.edu.vn', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120', xp: 950, streak: 12, role: 'student', status: 'active', createdAt: '2026-05-02' },
];
