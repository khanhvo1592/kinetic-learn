import React, { useState, useEffect } from 'react';
import { Subject, Lesson, QuizQuestion, Student } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { 
    subjects, lessons, quizzes, allStudents: students, 
    addSubject: onAddSubject, addLesson: onAddLesson, 
    addQuiz: onAddQuiz, updateStudent: onUpdateStudent, 
    deleteStudent: onDeleteStudent,
    deleteSubject, deleteLesson
  } = useAppContext();
  const onAddStudent = onUpdateStudent;
  const { isAdmin } = useAuth();
  
  // Tabs: 'subject' | 'lesson' | 'quiz' | 'students'
  const [activeTab, setActiveTab] = useState<'subject' | 'lesson' | 'quiz' | 'students'>(isAdmin ? 'students' : 'subject');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Subject Form States
  const [subjName, setSubjName] = useState('');
  const [subjIcon, setSubjIcon] = useState('calculate');
  const [subjColor, setSubjColor] = useState('#2196F3');
  const [subjBg, setSubjBg] = useState('#E3F2FD');

  // 2. Lesson Form States
  const [selectedSubjId, setSelectedSubjId] = useState(subjects[0]?.id || 'math');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonChapter, setLessonChapter] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [secTitle1, setSecTitle1] = useState('1. Khảo sát lý thuyết');
  const [secContent1, setSecContent1] = useState('');
  const [secTitle2, setSecTitle2] = useState('2. Ví dụ áp dụng');
  const [secContent2, setSecContent2] = useState('');

  // 3. Quiz Form States
  const [quizLessonId, setQuizLessonId] = useState(lessons[0]?.id || '');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [quizInputMode, setQuizInputMode] = useState<'single' | 'bulk'>('single');
  const [bulkQuizText, setBulkQuizText] = useState('');

  // 4. Student Management States
  const [searchStudent, setSearchStudent] = useState('');
  const [newStudName, setNewStudName] = useState('');
  const [newStudUsername, setNewStudUsername] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudXp, setNewStudXp] = useState(500);
  const [newStudStreak, setNewStudStreak] = useState(0);
  const [newStudRole, setNewStudRole] = useState<'student' | 'teacher'>('student');
  const [newStudAvatar, setNewStudAvatar] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120');

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;

    const newSubjId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      id: newSubjId,
      name: subjName.trim(),
      icon: subjIcon,
      color: subjColor,
      bgColor: subjBg,
      borderColor: `border-b-[${subjColor}]/30`,
      lessonsCount: 0,
      exercisesCount: 0
    };

    onAddSubject(newSubject);
    triggerToast(`Đã tạo thành công môn học mới: "${subjName}"`);
    setSubjName('');
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const matchSubj = subjects.find(s => s.id === selectedSubjId);
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      subjectId: selectedSubjId,
      subjectName: matchSubj ? matchSubj.name : 'Môn học mới',
      title: lessonTitle.trim(),
      chapter: lessonChapter.trim() || 'Chương 1',
      progress: 0,
      duration: '15 phút',
      lastStudied: 'Chưa học',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      iconName: 'menu_book',
      summary: lessonSummary.trim() || 'Tóm tắt bài học mới cập nhật từ giáo viên.',
      formulaTitle: formulaInput ? 'CÔNG THỨC CHỦ CHỐT' : undefined,
      formulas: formulaInput ? [formulaInput] : undefined,
      sections: [
        { title: secTitle1, content: secContent1 || 'Nội dung lý thuyết chưa cập nhật.' },
        { title: secTitle2, content: secContent2 || 'Ví dụ minh họa chi tiết.' }
      ]
    };

    onAddLesson(newLesson);
    triggerToast(`Đã thêm bài học mới: "${lessonTitle}"`);
    setLessonTitle('');
    setLessonChapter('');
    setLessonSummary('');
    setFormulaInput('');
    setSecContent1('');
    setSecContent2('');
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion.trim() || !optA.trim() || !optB.trim()) return;

    const newQuiz: QuizQuestion = {
      id: `quiz-${Date.now()}`,
      num: String(quizzes.length + 1).padStart(2, '0'),
      lessonId: quizLessonId,
      question: quizQuestion.trim(),
      options: [
        { key: 'A', text: optA.trim() },
        { key: 'B', text: optB.trim() },
        { key: 'C', text: optC.trim() || 'Khoảng trống' },
        { key: 'D', text: optD.trim() || 'Khoảng trống' }
      ],
      correctKey: correctKey,
      explanation: explanation.trim() || 'Lời giải chi tiết do giáo viên hệ thống biên soạn.'
    };

    onAddQuiz(newQuiz);
    triggerToast(`Đã thêm thành công một câu trắc nghiệm mới!`);
    setQuizQuestion('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
  };

  const handleBulkCreateQuiz = () => {
    if (!bulkQuizText.trim()) return;
    const blocks = bulkQuizText.split(/(?:Câu hỏi|Question)\s*:/i).filter(b => b.trim() !== '');
    let addedCount = 0;
    
    blocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length < 3) return;
        
        const question = lines[0];
        let oA = '', oB = '', oC = '', oD = '';
        let cKey = 'A';
        let expl = 'Lời giải chi tiết do giáo viên hệ thống biên soạn.';
        
        lines.slice(1).forEach(line => {
            if (line.match(/^[A]\./i)) oA = line.replace(/^[A]\./i, '').trim();
            else if (line.match(/^[B]\./i)) oB = line.replace(/^[B]\./i, '').trim();
            else if (line.match(/^[C]\./i)) oC = line.replace(/^[C]\./i, '').trim();
            else if (line.match(/^[D]\./i)) oD = line.replace(/^[D]\./i, '').trim();
            else if (line.match(/^(?:Đáp án|Ans|Answer)\s*:/i)) {
                const ans = line.replace(/^(?:Đáp án|Ans|Answer)\s*:/i, '').trim().toUpperCase();
                if (['A', 'B', 'C', 'D'].includes(ans)) cKey = ans;
            }
            else if (line.match(/^(?:Giải thích|Explanation)\s*:/i)) {
                expl = line.replace(/^(?:Giải thích|Explanation)\s*:/i, '').trim();
            }
        });
        
        if (!oA || !oB) return;
        
        const newQuiz: QuizQuestion = {
            id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            num: String(quizzes.length + addedCount + 1).padStart(2, '0'),
            lessonId: quizLessonId,
            question: question,
            options: [
                { key: 'A', text: oA },
                { key: 'B', text: oB },
                { key: 'C', text: oC || 'Khoảng trống' },
                { key: 'D', text: oD || 'Khoảng trống' }
            ],
            correctKey: cKey,
            explanation: expl
        };
        onAddQuiz(newQuiz);
        addedCount++;
    });
    
    if (addedCount > 0) {
        triggerToast(`Đã thêm thành công ${addedCount} câu hỏi trắc nghiệm!`);
        setBulkQuizText('');
    } else {
        alert('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra lại định dạng văn bản.');
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName.trim() || !newStudUsername.trim()) return;

    // Check unique username
    const exists = students.find(s => s.username.toLowerCase() === newStudUsername.trim().toLowerCase());
    if (exists) {
      triggerToast(`⚠️ Tên đăng nhập "${newStudUsername}" đã tồn tại!`);
      return;
    }

    const newStudent: Student = {
      id: `stud-${Date.now()}`,
      name: newStudName.trim(),
      username: newStudUsername.trim().toLowerCase(),
      email: newStudEmail.trim() || `${newStudUsername.trim().toLowerCase()}@kinetic.edu.vn`,
      avatar: newStudAvatar,
      xp: Number(newStudXp) || 0,
      streak: Number(newStudStreak) || 0,
      role: newStudRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddStudent(newStudent);
    triggerToast(`Đã cấp tài khoản ${newStudRole === 'teacher' ? 'giáo viên' : 'học sinh'}: "${newStudName}"`);
    setNewStudName('');
    setNewStudUsername('');
    setNewStudEmail('');
    setNewStudXp(500);
    setNewStudStreak(0);
    setNewStudRole('student');
  };

  const adjustXp = (student: Student, amount: number) => {
    onUpdateStudent({
      ...student,
      xp: Math.max(0, student.xp + amount)
    });
    triggerToast(`Đã cập nhật XP cho ${student.name} (+${amount} XP)`);
  };

  const adjustStreak = (student: Student, amount: number) => {
    onUpdateStudent({
      ...student,
      streak: Math.max(0, student.streak + amount)
    });
    triggerToast(`Đã cập nhật Streak cho ${student.name} (+${amount} ngày)`);
  };

  const toggleStudentStatus = (student: Student) => {
    const nextStatus = student.status === 'active' ? 'suspended' : 'active';
    onUpdateStudent({
      ...student,
      status: nextStatus
    });
    triggerToast(`Đã ${nextStatus === 'active' ? 'MỞ KHÓA' : 'TẠM KHÓA'} tài khoản ${student.name}`);
  };

  // Filter students based on search string
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.username.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] border-4 border-[#0058be] p-6 w-full max-w-3xl shadow-[0_16px_0_0_#004395] flex flex-col h-[640px] max-h-[92vh] animate-fadeIn">
        
        {/* Header bar */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-3xl font-bold animate-pulse">admin_panel_settings</span>
            <div>
              <h3 className="font-display font-black text-xl text-[#0058be]">Tổng Không Gian Quản Trị Admins</h3>
              <p className="text-[10px] text-slate-450 font-sans tracking-wide">Quản lý tài khoản học sinh, cơ sở dữ liệu khóa học và trắc nghiệm</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        {/* Navigation Tabs row */}
        <div className="flex border-b border-slate-100 pb-2 mb-4 overflow-x-auto gap-1 flex-shrink-0 no-scrollbar">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 px-4 font-display font-bold text-xs border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'students' ? 'border-[#0058be] text-[#0058be] font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              👤 Quản lý học sinh ({students.length})
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('subject')}
            className={`pb-3 px-4 font-display font-semibold text-xs border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'subject' ? 'border-[#0058be] text-[#0058be] font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">trophy</span>
            🥇 Tạo môn học ({subjects.length})
          </button>

          <button
            onClick={() => setActiveTab('lesson')}
            className={`pb-3 px-4 font-display font-semibold text-xs border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lesson' ? 'border-[#0058be] text-[#0058be] font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            📚 Tạo bài học ({lessons.length})
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-3 px-4 font-display font-semibold text-xs border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quiz' ? 'border-[#0058be] text-[#0058be] font-black' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">quiz</span>
            ❓ Thêm trắc nghiệm ({quizzes.length})
          </button>
        </div>

        {/* Scrollable form action contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
          
          {/* Toast Notification message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {successMsg}
            </div>
          )}

          {/* TAB: STUDENTS MANAGEMENT (Requested Feature) */}
          {isAdmin && activeTab === 'students' && (
            <div className="space-y-6 font-sans text-xs">
              
              {/* Quick Metrics stats banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-slate-550 text-[10px] uppercase tracking-wider">Tổng học sinh</h5>
                    <p className="text-2xl font-display font-black text-[#0058be] mt-0.5">{students.length}</p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-blue-500 bg-white p-2 rounded-xl border border-blue-50">group</span>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-slate-550 text-[10px] uppercase tracking-wider">Đang hoạt động</h5>
                    <p className="text-2xl font-display font-black text-emerald-600 mt-0.5">
                      {students.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-emerald-500 bg-white p-2 rounded-xl border border-emerald-50">verified_user</span>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-slate-550 text-[10px] uppercase tracking-wider">Đang tạm khóa</h5>
                    <p className="text-2xl font-display font-black text-rose-600 mt-0.5">
                      {students.filter(s => s.status === 'suspended').length}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-rose-500 bg-white p-2 rounded-xl border border-rose-50">block</span>
                </div>
              </div>

              {/* Quick New Student creation form */}
              <form onSubmit={handleCreateStudent} className="bg-slate-50 border border-slate-200 rounded-[24px] p-4 space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/55">
                  <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#0058be]">person_add</span>
                    Cấp tài khoản học sinh mới
                  </h4>
                  <span className="text-[10px] text-slate-400 font-sans">Đăng ký mới lập tức có tác dụng</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="font-black text-slate-500">Tên học sinh</label>
                    <input
                      type="text"
                      required
                      value={newStudName}
                      onChange={(e) => setNewStudName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Long"
                      className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-lg px-2.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Tên đăng nhập</label>
                    <input
                      type="text"
                      required
                      value={newStudUsername}
                      onChange={(e) => setNewStudUsername(e.target.value)}
                      placeholder="Ví dụ: longhoang"
                      className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-lg px-2.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={newStudEmail}
                      onChange={(e) => setNewStudEmail(e.target.value)}
                      placeholder="Bỏ trống để tự sinh"
                      className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-lg px-2.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Số điểm XP ban đầu</label>
                    <input
                      type="number"
                      value={newStudXp}
                      onChange={(e) => setNewStudXp(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-lg px-2.5 py-2.5 text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-500">Số ngày Streak</label>
                    <input
                      type="number"
                      value={newStudStreak}
                      onChange={(e) => setNewStudStreak(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Phân quyền</label>
                    <select
                      value={newStudRole}
                      onChange={(e) => setNewStudRole(e.target.value as 'student' | 'teacher')}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-lg px-3 py-2 text-xs outline-none font-bold"
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                    </select>
                  </div>
                </div>

                {/* Avatar choosing block */}
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-500">Chọn chân dung đại diện:</span>
                  <div className="flex gap-2">
                    {[
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
                      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120'
                    ].map(url => (
                      <button
                        type="button"
                        key={url}
                        onClick={() => setNewStudAvatar(url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          newStudAvatar === url ? 'border-[#0058be] scale-110 ring-2 ring-blue-100' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt="Avatar Selection" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="ml-auto bg-[#0058be] hover:bg-blue-700 text-white font-display font-black text-xs px-5 py-3 rounded-xl transition-all shadow-[0_3px_0_0_#004395] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Cấp Tài Khoản</span>
                    <span className="material-symbols-outlined text-xs">add_circle</span>
                  </button>
                </div>
              </form>

              {/* Filter student directory & Student List Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <h4 className="font-display font-bold text-sm text-slate-800">Danh sách tài khoản hệ thống</h4>
                  
                  {/* Search filter input */}
                  <div className="relative w-48 md:w-64">
                    <span className="absolute left-2.5 top-2.5 material-symbols-outlined text-slate-400 text-xs">search</span>
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Tìm theo tên, email, tài khoản..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-lg pl-8 pr-3 py-2 text-[11px] outline-none"
                    />
                  </div>
                </div>

                {/* Main scrollable list containing cards */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar border border-slate-100 rounded-2xl p-2 bg-slate-50/20">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      Không tìm thấy tài khoản học sinh phù hợp.
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <div 
                        key={student.id}
                        className={`flex items-center justify-between p-3 bg-white rounded-xl border transition-all ${
                          student.status === 'suspended' ? 'opacity-70 border-rose-100 bg-rose-50/10' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {/* Profile left column */}
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-slate-750 text-xs">{student.name}</h5>
                              {student.role === 'teacher' && (
                                <span className="bg-purple-100 text-purple-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-200">
                                  Giáo viên
                                </span>
                              )}
                              {student.role === 'admin' && (
                                <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-200">
                                  Admin
                                </span>
                              )}
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                                student.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {student.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex gap-2">
                              <span>User: <strong>{student.username}</strong></span>
                              <span>•</span>
                              <span>Email: {student.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Gamification metric sliders column */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end pr-2 border-r border-slate-100">
                            <span className="text-[10px] font-mono font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full">
                              ⭐ {student.xp} XP
                            </span>
                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() => adjustXp(student, 100)}
                                className="bg-slate-100 hover:bg-amber-100 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md text-slate-600 hover:text-amber-800 transition-colors"
                              >
                                +100 XP
                              </button>
                              <button
                                onClick={() => adjustXp(student, -50)}
                                className="bg-slate-100 hover:bg-rose-100 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md text-slate-600 hover:text-rose-800 transition-colors"
                              >
                                -50 XP
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col items-end pr-3 border-r border-slate-100">
                            <span className="text-[10px] font-mono font-bold text-blue-600 flex items-center gap-0.5 bg-blue-50 px-2 py-0.5 rounded-full">
                              🔥 {student.streak} ngày
                            </span>
                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() => adjustStreak(student, 5)}
                                className="bg-slate-100 hover:bg-blue-100 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md text-slate-600 hover:text-blue-800 transition-colors"
                              >
                                +5 ngày
                              </button>
                              <button
                                onClick={() => adjustStreak(student, -1)}
                                className="bg-slate-100 hover:bg-rose-100 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md text-slate-600 hover:text-rose-800 transition-colors"
                              >
                                -1N
                              </button>
                            </div>
                          </div>

                          {/* Quick Admin action buttons */}
                          <div className="flex items-center gap-1.5 pl-1.5">
                            <select
                              value={student.role}
                              onChange={(e) => {
                                onUpdateStudent({ ...student, role: e.target.value as any });
                                triggerToast(`Đã đổi quyền thành ${e.target.value === 'teacher' ? 'Giáo viên' : e.target.value === 'admin' ? 'Admin' : 'Học sinh'}`);
                              }}
                              disabled={student.id === 'stud-001'}
                              className="bg-slate-50 border border-slate-200 text-[10px] rounded px-1 py-1 outline-none font-bold mr-1"
                            >
                              <option value="student">Học sinh</option>
                              <option value="teacher">Giáo viên</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => toggleStudentStatus(student)}
                              title={student.status === 'active' ? 'Click để khóa tạm thời' : 'Click để mở khóa học'}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
                                student.status === 'active' 
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {student.status === 'active' ? 'lock' : 'lock_open'}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.name}" này khỏi hệ thống?`)) {
                                  onDeleteStudent(student.id);
                                  triggerToast(`Đã xóa hoàn toàn học sinh khỏi danh sách.`);
                                }
                              }}
                              title="Xóa vĩnh viễn tài khoản"
                              className="w-8 h-8 rounded-full bg-slate-105 hover:bg-rose-500 hover:text-white text-slate-450 border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: CREATE SUBJECT FORM */}
          {activeTab === 'subject' && (
            <form onSubmit={handleCreateSubject} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider">Tên môn học mới</label>
                <input
                  type="text"
                  required
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="Ví dụ: Lịch Sử, Khoa Học Tự Nhiên, Tin Học..."
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Chọn biểu tượng mẫu</label>
                  <select
                    value={subjIcon}
                    onChange={(e) => setSubjIcon(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                  >
                    <option value="calculate">🧮 Máy tính (Toán)</option>
                    <option value="menu_book">📖 Sách vở (Văn)</option>
                    <option value="translate">🌐 Dịch thuật (Anh)</option>
                    <option value="bolt">⚡ Tia sét (Vật lý)</option>
                    <option value="science">🧪 Ống nghiệm (Hóa)</option>
                    <option value="eco">🌱 Mầm cây (Sinh học)</option>
                    <option value="history_edu">🖋️ Lông viết (Sử)</option>
                    <option value="public">🌍 Địa cầu (Địa lý)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Màu sắc chủ đề (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={subjColor}
                      onChange={(e) => {
                        setSubjColor(e.target.value);
                        setSubjBg(e.target.value + '20');
                      }}
                      className="w-11 h-11 border-2 border-slate-200 rounded-xl cursor-pointer p-1 bg-white"
                    />
                    <input
                      type="text"
                      value={subjColor}
                      onChange={(e) => setSubjColor(e.target.value)}
                      className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#0058be] text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Tạo môn học <span className="material-symbols-outlined text-sm">add_circle</span>
              </button>

              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Danh sách Môn học hiện tại</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scroll-hide">
                  {subjects.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                          <span className="material-symbols-outlined text-sm">{s.icon}</span>
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Bạn có chắc chắn muốn xóa môn học "${s.name}" không?`)) {
                            try {
                              await deleteSubject(s.id);
                              triggerToast(`Đã xóa thành công môn học ${s.name}`);
                            } catch (error: any) {
                              console.error(error);
                              alert(`Lỗi khi xóa môn học: ${error.message}`);
                            }
                          }
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg block">delete</span>
                      </button>
                    </div>
                  ))}
                  {subjects.length === 0 && <p className="text-slate-400 italic text-center">Chưa có môn học nào.</p>}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE LESSON FORM */}
          {activeTab === 'lesson' && (
            <form onSubmit={handleCreateLesson} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Thuộc môn học</label>
                  <select
                    value={selectedSubjId}
                    onChange={(e) => setSelectedSubjId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Chương/Phần học</label>
                  <input
                    type="text"
                    required
                    value={lessonChapter}
                    onChange={(e) => setLessonChapter(e.target.value)}
                    placeholder="Ví dụ: Chương 1: Thành phần chất"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider">Tên bài học</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 3: Sơ đồ liên kết cộng hóa trị"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider">Tóm tắt ngắn</label>
                <textarea
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  placeholder="Tóm tắt nội dung cốt lõi của bài để học sinh nắm bắt nhanh..."
                  className="w-full h-16 bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider">Công thức cần nhớ (nếu có)</label>
                <input
                  type="text"
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  placeholder="Ví dụ: Hóa trị Al = III, số oxi hóa H = +1"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                />
              </div>

              {/* Dynamic Section Contents */}
              <div className="p-4 bg-slate-50/55 rounded-2xl border border-slate-200/50 space-y-3">
                <span className="font-display font-black text-xs text-[#0058be]">Nội dung chi tiết</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={secTitle1} 
                      onChange={(e) => setSecTitle1(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold outline-none focus:border-[#0058be]"
                    />
                    <textarea
                      required
                      value={secContent1}
                      onChange={(e) => setSecContent1(e.target.value)}
                      placeholder="Chi tiết phần 1..."
                      className="w-full h-20 bg-white border border-slate-200 rounded-lg p-2 resize-none outline-none focus:border-[#0058be]"
                    />
                  </div>

                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={secTitle2} 
                      onChange={(e) => setSecTitle2(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold outline-none focus:border-[#0058be]"
                    />
                    <textarea
                      value={secContent2}
                      onChange={(e) => setSecContent2(e.target.value)}
                      placeholder="Chi tiết phần 2..."
                      className="w-full h-20 bg-white border border-slate-200 rounded-lg p-2 resize-none outline-none focus:border-[#0058be]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#0058be] text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Thêm bài học mới <span className="material-symbols-outlined text-sm">menu_book</span>
              </button>

              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Danh sách Bài học hiện tại</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scroll-hide">
                  {lessons.map(l => (
                    <div key={l.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700 text-sm leading-tight">{l.title}</span>
                        <span className="text-xs text-slate-500">{l.subjectName} • {l.chapter}</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${l.title}" không?`)) {
                            try {
                              await deleteLesson(l.id);
                              triggerToast(`Đã xóa thành công bài học ${l.title}`);
                            } catch (error: any) {
                              console.error(error);
                              alert(`Lỗi khi xóa bài học: ${error.message}`);
                            }
                          }
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg shrink-0"
                      >
                        <span className="material-symbols-outlined text-lg block">delete</span>
                      </button>
                    </div>
                  ))}
                  {lessons.length === 0 && <p className="text-slate-400 italic text-center">Chưa có bài học nào.</p>}
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE QUIZ FORM */}
          {activeTab === 'quiz' && (
            <form onSubmit={handleCreateQuiz} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider block mb-1">Thuộc bài học tương ứng</label>
                  <select
                    value={quizLessonId}
                    onChange={(e) => setQuizLessonId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-2.5 text-xs outline-none font-bold text-slate-705"
                  >
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title} ({l.subjectName})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 flex items-end">
                  <p className="text-[10px] text-slate-450 italic leading-snug">
                    💡 Chọn bài học, sau đó chọn cách thức soạn thảo bên dưới.
                  </p>
                </div>
              </div>

              {/* Toggle Input Mode */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setQuizInputMode('single')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${quizInputMode === 'single' ? 'bg-white text-[#0058be] shadow-sm' : 'text-slate-500'}`}
                >
                  Soạn từng câu
                </button>
                <button
                  type="button"
                  onClick={() => setQuizInputMode('bulk')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${quizInputMode === 'bulk' ? 'bg-white text-[#0058be] shadow-sm' : 'text-slate-500'}`}
                >
                  Soạn hàng loạt
                </button>
              </div>

              {quizInputMode === 'single' ? (
                <>
                  <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider">Nội dung câu hỏi trắc nghiệm</label>
                <textarea
                  required
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  placeholder="Ví dụ: Phân tử muối ăn có công thức hóa học là gì?"
                  className="w-full h-16 bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none resize-none"
                />
              </div>

              {/* 4 Options layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án A</label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Đáp án A"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án B</label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Đáp án B"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án C</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Đáp án C"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đáp án D</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Đáp án D"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Đáp án chính xác</label>
                  <select
                    value={correctKey}
                    onChange={(e) => setCorrectKey(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-2.5 text-xs outline-none"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Lời giải chi tiết</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Ví dụ: Muối ăn là NaCl, kết hợp giữa Na (+) và Cl (-)..."
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-2.5 text-xs outline-none"
                  />
                </div>
              </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-purple-600 text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#5516be] hover:bg-purple-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Thêm trắc nghiệm mới <span className="material-symbols-outlined text-sm">quiz</span>
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-600 uppercase tracking-wider">Dán danh sách câu hỏi vào đây</label>
                  <div className="text-[10px] text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <strong>Định dạng yêu cầu:</strong><br/>
                    Câu hỏi: [Nội dung câu hỏi]<br/>
                    A. [Đáp án A]<br/>
                    B. [Đáp án B]<br/>
                    C. [Đáp án C] (Tùy chọn)<br/>
                    D. [Đáp án D] (Tùy chọn)<br/>
                    Đáp án: [A/B/C/D]<br/>
                    Giải thích: [Lời giải] (Tùy chọn)
                  </div>
                  <textarea
                    value={bulkQuizText}
                    onChange={(e) => setBulkQuizText(e.target.value)}
                    placeholder={`Câu hỏi: Bác Hồ ra đi tìm đường cứu nước năm nào?\nA. 1910\nB. 1911\nC. 1912\nD. 1913\nĐáp án: B\nGiải thích: Ngày 5/6/1911...`}
                    className="w-full h-64 bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl p-4 text-xs font-mono outline-none resize-y whitespace-pre-wrap leading-relaxed"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleBulkCreateQuiz}
                  className="w-full h-11 bg-emerald-600 text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Phân tích & Thêm hàng loạt <span className="material-symbols-outlined text-sm">library_add</span>
                </button>
              </div>
            )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
