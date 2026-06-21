import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject, Lesson, QuizQuestion, Student, ExamTemplate } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useExamTemplates } from '../hooks/useExamTemplates';
import { usePublicQuizAttempts } from '../hooks/usePublicQuizAttempts';
import MathText from '../components/common/MathText';

function RichTextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wrapSelection = (before: string, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end).trim();
    const items = selectedText
      ? selectedText.split('\n').map(line => `<li>${line.replace(/^[-*]\s*/, '')}</li>`).join('')
      : '<li>Mục nội dung</li>';
    const nextValue = `${value.slice(0, start)}<ul>${items}</ul>${value.slice(end)}`;
    onChange(nextValue);

    window.requestAnimationFrame(() => textarea.focus());
  };

  const insertMath = (displayMode = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end) || '\\frac{a}{b}';
    const before = displayMode ? '$$' : '$';
    const after = displayMode ? '$$' : '$';
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden focus-within:border-[#0058be] shadow-sm">
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
        <button type="button" onClick={() => wrapSelection('<strong>', '</strong>')} className="h-8 w-8 rounded-md text-sm font-black text-slate-700 hover:bg-white border border-transparent hover:border-slate-200" title="In đậm">
          B
        </button>
        <button type="button" onClick={() => wrapSelection('<em>', '</em>')} className="h-8 w-8 rounded-md text-sm italic font-bold text-slate-700 hover:bg-white border border-transparent hover:border-slate-200" title="In nghiêng">
          I
        </button>
        <button type="button" onClick={insertList} className="h-8 px-2 rounded-md text-xs font-bold text-slate-700 hover:bg-white border border-transparent hover:border-slate-200" title="Danh sách">
          List
        </button>
        <button type="button" onClick={() => insertMath(false)} className="h-8 px-2 rounded-md text-xs font-bold text-slate-700 hover:bg-white border border-transparent hover:border-slate-200" title="Công thức trong dòng">
          $x$
        </button>
        <button type="button" onClick={() => insertMath(true)} className="h-8 px-2 rounded-md text-xs font-bold text-slate-700 hover:bg-white border border-transparent hover:border-slate-200" title="Công thức riêng dòng">
          $$x$$
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-48 w-full resize-y bg-white px-3 py-3 text-sm leading-relaxed outline-none"
      />
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { 
    subjects, lessons, quizzes, allStudents: students, 
    addSubject: onAddSubject, addLesson: onAddLesson, 
    addQuiz: onAddQuiz, updateStudent: onUpdateStudent, 
    deleteStudent: onDeleteStudent,
    deleteSubject, deleteLesson,
    updateLesson: onUpdateLesson, updateQuiz: onUpdateQuiz, deleteQuiz
  } = useAppContext();
  const onAddStudent = onUpdateStudent;
  const { isAdmin } = useAuth();
  const { currentUser } = useAuth();
  const { examTemplates, saveExamTemplate, deleteExamTemplate } = useExamTemplates();
  const { attempts: publicQuizAttempts } = usePublicQuizAttempts();
  
  // Tabs: 'subject' | 'lesson' | 'quiz' | 'exam' | 'students'
  const [activeTab, setActiveTab] = useState<'subject' | 'lesson' | 'quiz' | 'exam' | 'results' | 'students'>(isAdmin ? 'students' : 'lesson');
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
  const [lessonMediaType, setLessonMediaType] = useState<'none' | 'image' | 'youtube' | 'video'>('none');
  const [lessonMediaUrl, setLessonMediaUrl] = useState('');
  const [lessonStatus, setLessonStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formulaInput, setFormulaInput] = useState('');
  const [lessonSections, setLessonSections] = useState([{ title: '1. Khảo sát lý thuyết', content: '', type: 'text' as const }, { title: '2. Ví dụ áp dụng', content: '', type: 'text' as const }]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // 3. Quiz Form States
  const [quizLessonId, setQuizLessonId] = useState(lessons[0]?.id || '');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizTags, setQuizTags] = useState('');
  const [quizInputMode, setQuizInputMode] = useState<'single' | 'bulk'>('single');
  const [bulkQuizText, setBulkQuizText] = useState('');
  const [bulkPreviewQuizzes, setBulkPreviewQuizzes] = useState<QuizQuestion[]>([]);
  const [quizSearch, setQuizSearch] = useState('');
  const [quizDifficultyFilter, setQuizDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // 3b. Exam Template Form States
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState('');
  const [examDurationMinutes, setExamDurationMinutes] = useState(15);
  const [examQuestionIds, setExamQuestionIds] = useState<string[]>([]);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // 4. Student Management States
  const [searchStudent, setSearchStudent] = useState('');
  const [newStudName, setNewStudName] = useState('');
  const [newStudUsername, setNewStudUsername] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudXp, setNewStudXp] = useState(500);
  const [newStudStreak, setNewStudStreak] = useState(0);
  const [newStudRole, setNewStudRole] = useState<'student' | 'teacher'>('student');
  const [newStudPassword, setNewStudPassword] = useState(Math.random().toString(36).slice(-8));
  const [newStudTeacherId, setNewStudTeacherId] = useState('');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(subject => subject.id === selectedSubjId)) {
      setSelectedSubjId(subjects[0].id);
    }
  }, [subjects, selectedSubjId]);

  useEffect(() => {
    if (lessons.length > 0 && (!quizLessonId || !lessons.some(lesson => lesson.id === quizLessonId))) {
      setQuizLessonId(lessons[0].id);
    }
  }, [lessons, quizLessonId]);

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
    const now = new Date().toISOString();
    
    if (editingLessonId) {
      const existing = lessons.find(l => l.id === editingLessonId);
      if (existing) {
        const updatedLesson: Lesson = {
          ...existing,
          subjectId: selectedSubjId,
          subjectName: matchSubj ? matchSubj.name : existing.subjectName,
          title: lessonTitle.trim(),
          chapter: lessonChapter.trim() || 'Chương 1',
          mediaType: lessonMediaType,
          mediaUrl: lessonMediaUrl.trim() || undefined,
          videoUrl: lessonMediaType === 'video' ? lessonMediaUrl.trim() : existing.videoUrl,
          status: lessonStatus,
          teacherId: existing.teacherId || existing.createdBy || currentUser?.id,
          createdBy: existing.createdBy || currentUser?.id,
          updatedAt: now,
          summary: lessonSummary.trim() || 'Tóm tắt bài học mới cập nhật từ giáo viên.',
          formulaTitle: formulaInput ? 'CÔNG THỨC CHỦ CHỐT' : undefined,
          formulas: formulaInput ? [formulaInput] : undefined,
          sections: lessonSections.map(s => ({ ...s, content: s.content || 'Nội dung trống.' }))
        };
        onUpdateLesson(updatedLesson);
        triggerToast(`Đã cập nhật bài học: "${lessonTitle}"`);
      }
    } else {
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        subjectId: selectedSubjId,
        subjectName: matchSubj ? matchSubj.name : 'Môn học mới',
        title: lessonTitle.trim(),
        chapter: lessonChapter.trim() || 'Chương 1',
        mediaType: lessonMediaType,
        mediaUrl: lessonMediaUrl.trim() || undefined,
        videoUrl: lessonMediaType === 'video' ? lessonMediaUrl.trim() : undefined,
        status: lessonStatus,
        teacherId: currentUser?.id,
        createdBy: currentUser?.id,
        createdAt: now,
        updatedAt: now,
        progress: 0,
        duration: '15 phút',
        lastStudied: 'Chưa học',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        iconName: 'menu_book',
        summary: lessonSummary.trim() || 'Tóm tắt bài học mới cập nhật từ giáo viên.',
        formulaTitle: formulaInput ? 'CÔNG THỨC CHỦ CHỐT' : undefined,
        formulas: formulaInput ? [formulaInput] : undefined,
        sections: lessonSections.map(s => ({ ...s, content: s.content || 'Nội dung trống.' }))
      };
      onAddLesson(newLesson);
      triggerToast(`Đã thêm bài học mới: "${lessonTitle}"`);
    }

    resetLessonForm();
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonChapter('');
    setLessonSummary('');
    setLessonMediaType('none');
    setLessonMediaUrl('');
    setLessonStatus('published');
    setFormulaInput('');
    setLessonSections([{ title: '', content: '', type: 'text' }]);
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setSelectedSubjId(lesson.subjectId);
    setLessonTitle(lesson.title);
    setLessonChapter(lesson.chapter);
    setLessonSummary(lesson.summary || '');
    setLessonMediaType(lesson.mediaType || (lesson.videoUrl ? 'video' : 'none'));
    setLessonMediaUrl(lesson.mediaUrl || lesson.videoUrl || '');
    setLessonStatus(lesson.status || 'published');
    setFormulaInput(lesson.formulas && lesson.formulas.length > 0 ? lesson.formulas[0] : '');
    setLessonSections(lesson.sections && lesson.sections.length > 0 ? lesson.sections : [{ title: '1. Khảo sát lý thuyết', content: '', type: 'text' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion.trim() || !optA.trim() || !optB.trim()) return;

    const selectedLesson = lessons.find(l => l.id === quizLessonId);
    const normalizedTags = quizTags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    if (editingQuizId) {
      const existing = quizzes.find(q => q.id === editingQuizId);
      if (existing) {
        const updatedQuiz: QuizQuestion = {
          ...existing,
          lessonId: quizLessonId,
          subjectId: selectedLesson?.subjectId || existing.subjectId,
          question: quizQuestion.trim(),
          options: [
            { key: 'A', text: optA.trim() },
            { key: 'B', text: optB.trim() },
            { key: 'C', text: optC.trim() || 'Khoảng trống' },
            { key: 'D', text: optD.trim() || 'Khoảng trống' }
          ],
          correctKey: correctKey,
          explanation: explanation.trim() || 'Lời giải chi tiết do giáo viên hệ thống biên soạn.',
          difficulty: quizDifficulty,
          tags: normalizedTags,
        };
        onUpdateQuiz(updatedQuiz);
        triggerToast(`Đã cập nhật câu trắc nghiệm!`);
      }
    } else {
      const newQuiz: QuizQuestion = {
        id: `quiz-${Date.now()}`,
        num: String(quizzes.filter(q => q.lessonId === quizLessonId).length + 1).padStart(2, '0'),
        lessonId: quizLessonId,
        subjectId: selectedLesson?.subjectId,
        question: quizQuestion.trim(),
        options: [
          { key: 'A', text: optA.trim() },
          { key: 'B', text: optB.trim() },
          { key: 'C', text: optC.trim() || 'Khoảng trống' },
          { key: 'D', text: optD.trim() || 'Khoảng trống' }
        ],
        correctKey: correctKey,
        explanation: explanation.trim() || 'Lời giải chi tiết do giáo viên hệ thống biên soạn.',
        difficulty: quizDifficulty,
        tags: normalizedTags,
      };
      onAddQuiz(newQuiz);
      triggerToast(`Đã thêm thành công một câu trắc nghiệm mới!`);
    }
    
    resetQuizForm();
  };

  const resetQuizForm = () => {
    setEditingQuizId(null);
    setQuizQuestion('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectKey('A');
    setExplanation('');
    setQuizDifficulty('medium');
    setQuizTags('');
  };

  const startEditQuiz = (quiz: QuizQuestion) => {
    setEditingQuizId(quiz.id);
    setQuizLessonId(quiz.lessonId);
    setQuizQuestion(quiz.question);
    setOptA(quiz.options.find(o => o.key === 'A')?.text || '');
    setOptB(quiz.options.find(o => o.key === 'B')?.text || '');
    setOptC(quiz.options.find(o => o.key === 'C')?.text || '');
    setOptD(quiz.options.find(o => o.key === 'D')?.text || '');
    setCorrectKey(quiz.correctKey);
    setExplanation(quiz.explanation || '');
    setQuizDifficulty(quiz.difficulty || 'medium');
    setQuizTags((quiz.tags || []).join(', '));
    setQuizInputMode('single');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleBulkCreateQuiz = () => {
    if (!bulkQuizText.trim()) return;
    const selectedLesson = lessons.find(l => l.id === quizLessonId);
    const blocks = bulkQuizText.split(/(?:Câu hỏi|Question|Q)\s*[:.]/i).filter(b => b.trim() !== '');
    const parsed: QuizQuestion[] = [];
    
    blocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length < 3) return;
        
        const question = lines[0];
        let oA = '', oB = '', oC = '', oD = '';
        let cKey = 'A';
        let expl = 'Lời giải chi tiết do giáo viên hệ thống biên soạn.';
        let difficulty: 'easy' | 'medium' | 'hard' = quizDifficulty;
        let tags = quizTags.split(',').map(tag => tag.trim()).filter(Boolean);
        
        lines.slice(1).forEach(line => {
            if (line.match(/^[A][\.\)]/i)) oA = line.replace(/^[A][\.\)]/i, '').trim();
            else if (line.match(/^[B][\.\)]/i)) oB = line.replace(/^[B][\.\)]/i, '').trim();
            else if (line.match(/^[C][\.\)]/i)) oC = line.replace(/^[C][\.\)]/i, '').trim();
            else if (line.match(/^[D][\.\)]/i)) oD = line.replace(/^[D][\.\)]/i, '').trim();
            else if (line.match(/^(?:Đáp án|Ans|Answer)\s*:/i)) {
                const ans = line.replace(/^(?:Đáp án|Ans|Answer)\s*:/i, '').trim().toUpperCase();
                if (['A', 'B', 'C', 'D'].includes(ans)) cKey = ans;
            }
            else if (line.match(/^(?:Giải thích|Explanation)\s*:/i)) {
                expl = line.replace(/^(?:Giải thích|Explanation)\s*:/i, '').trim();
            }
            else if (line.match(/^(?:Độ khó|Difficulty)\s*:/i)) {
                const rawDifficulty = line.replace(/^(?:Độ khó|Difficulty)\s*:/i, '').trim().toLowerCase();
                if (['easy', 'de', 'dễ'].includes(rawDifficulty)) difficulty = 'easy';
                if (['medium', 'trung bình', 'vừa'].includes(rawDifficulty)) difficulty = 'medium';
                if (['hard', 'khó', 'kho'].includes(rawDifficulty)) difficulty = 'hard';
            }
            else if (line.match(/^(?:Tags?|Nhãn|Chu đề|Chủ đề)\s*:/i)) {
                tags = line.replace(/^(?:Tags?|Nhãn|Chu đề|Chủ đề)\s*:/i, '')
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(Boolean);
            }
        });
        
        if (!oA || !oB) return;
        
        const newQuiz: QuizQuestion = {
            id: `preview-quiz-${Date.now()}-${index}`,
            num: String(quizzes.length + parsed.length + 1).padStart(2, '0'),
            lessonId: quizLessonId,
            subjectId: selectedLesson?.subjectId,
            question: question,
            options: [
                { key: 'A', text: oA },
                { key: 'B', text: oB },
                { key: 'C', text: oC || 'Khoảng trống' },
                { key: 'D', text: oD || 'Khoảng trống' }
            ],
            correctKey: cKey,
            explanation: expl,
            difficulty,
            tags,
        };
        parsed.push(newQuiz);
    });
    
    if (parsed.length > 0) {
        setBulkPreviewQuizzes(parsed);
    } else {
        alert('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra lại định dạng văn bản.');
    }
  };

  const handleConfirmBulkQuizzes = () => {
    bulkPreviewQuizzes.forEach(quiz => {
        onAddQuiz({
            ...quiz,
            id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        });
    });
    triggerToast(`Đã thêm thành công ${bulkPreviewQuizzes.length} câu hỏi trắc nghiệm!`);
    setBulkQuizText('');
    setBulkPreviewQuizzes([]);
  };

  const resetExamForm = () => {
    setEditingExamId(null);
    setExamTitle('');
    setExamSubjectId('');
    setExamDurationMinutes(15);
    setExamQuestionIds([]);
  };

  const toggleExamQuestion = (questionId: string) => {
    setExamQuestionIds(prev => (
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    ));
  };

  const handleSaveExam = async (status: ExamTemplate['status']) => {
    if (!currentUser) return;
    if (!examTitle.trim()) {
      alert('Vui lòng nhập tên đề kiểm tra.');
      return;
    }
    if (examQuestionIds.length === 0) {
      alert('Vui lòng chọn ít nhất một câu hỏi.');
      return;
    }

    const existing = editingExamId ? examTemplates.find(e => e.id === editingExamId) : null;
    const now = new Date().toISOString();
    const exam: ExamTemplate = {
      id: existing?.id || `exam-${Date.now()}`,
      title: examTitle.trim(),
      subjectId: examSubjectId || undefined,
      lessonIds: [],
      questionIds: examQuestionIds,
      durationSeconds: Math.max(1, Number(examDurationMinutes) || 15) * 60,
      shuffleQuestions: existing?.shuffleQuestions ?? false,
      shuffleOptions: existing?.shuffleOptions ?? false,
      status,
      isPublic: status === 'published' ? true : existing?.isPublic,
      shareSlug: existing?.shareSlug,
      publicTitle: existing?.publicTitle || examTitle.trim(),
      requireName: true,
      teacherId: existing?.teacherId || currentUser.id,
      createdBy: existing?.createdBy || currentUser.id,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await saveExamTemplate(exam);
    triggerToast(status === 'published' ? 'Đã xuất bản đề kiểm tra!' : 'Đã lưu nháp đề kiểm tra!');
    resetExamForm();
  };

  const startEditExam = (exam: ExamTemplate) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamSubjectId(exam.subjectId || '');
    setExamDurationMinutes(Math.max(1, Math.round(exam.durationSeconds / 60)));
    setExamQuestionIds(exam.questionIds);
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${newStudUsername.trim().toLowerCase()}`,
      xp: Number(newStudXp) || 0,
      streak: Number(newStudStreak) || 0,
      role: isAdmin ? newStudRole : 'student',
      status: 'active',
      email: newStudEmail.trim() || `${newStudUsername.trim().toLowerCase()}@kinetic.edu.vn`,
      teacherId: newStudTeacherId || (!isAdmin ? currentUser?.id : undefined),
      password: newStudPassword.trim(),
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
    setNewStudTeacherId('');
    setNewStudPassword(Math.random().toString(36).slice(-8));
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

  // Lọc học sinh (nếu là giáo viên thì chỉ thấy học sinh của mình)
  const availableTeachers = students.filter(s => s.role === 'teacher' || s.role === 'admin');
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.username.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase());
    
    // Nếu không phải admin (tức là giáo viên), chỉ thấy học sinh mà mình được gán hoặc học sinh chưa được gán
    // Yêu cầu "lọc theo giáo viên"
    return matchesSearch;
  });

  const selectedQuizLesson = lessons.find(l => l.id === quizLessonId);
  const quizzesForSelectedLesson = quizzes.filter(q => q.lessonId === quizLessonId);
  const quizSearchTerm = quizSearch.trim().toLowerCase();
  const filteredQuizzesForSelectedLesson = quizzesForSelectedLesson.filter(q => {
    const matchesDifficulty = quizDifficultyFilter === 'all' || q.difficulty === quizDifficultyFilter;
    const matchesSearch = !quizSearchTerm ||
      q.question.toLowerCase().includes(quizSearchTerm) ||
      q.explanation.toLowerCase().includes(quizSearchTerm) ||
      q.options.some(option => option.text.toLowerCase().includes(quizSearchTerm)) ||
      (q.tags || []).some(tag => tag.toLowerCase().includes(quizSearchTerm));
    return matchesDifficulty && matchesSearch;
  });
  const quizDifficultyCounts = quizzesForSelectedLesson.reduce(
    (counts, quiz) => {
      counts[quiz.difficulty || 'medium'] += 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0 } as Record<'easy' | 'medium' | 'hard', number>
  );
  const singleQuizOptions = [
    { key: 'A', value: optA },
    { key: 'B', value: optB },
    { key: 'C', value: optC },
    { key: 'D', value: optD },
  ];
  const singleQuizReadyCount = [
    quizLessonId,
    quizQuestion.trim(),
    optA.trim(),
    optB.trim(),
    explanation.trim(),
  ].filter(Boolean).length;
  const singleQuizCompleteness = Math.round((singleQuizReadyCount / 5) * 100);
  const difficultyLabel: Record<'easy' | 'medium' | 'hard', string> = {
    easy: 'Dễ',
    medium: 'Vừa',
    hard: 'Khó',
  };
  const selectedLessonSubject = subjects.find(subject => subject.id === selectedSubjId);
  const lessonTextContent = [
    lessonTitle,
    lessonChapter,
    lessonSummary,
    formulaInput,
    ...lessonSections.map(section => `${section.title} ${section.content}`),
  ].join(' ');
  const lessonWordCount = lessonTextContent
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const lessonCompleteness = Math.round(([
    lessonTitle.trim(),
    lessonChapter.trim(),
    lessonSummary.trim(),
    lessonSections.some(section => section.title.trim() && section.content.trim()) ? 'content' : '',
  ].filter(Boolean).length / 4) * 100);
  const lessonTypeLabel: Record<string, string> = {
    text: 'Đoạn văn',
    video: 'YouTube',
    video_raw: 'Video',
    image: 'Hình ảnh',
    audio: 'Âm thanh',
    formula: 'Công thức',
  };
  const addLessonBlock = (type: 'text' | 'video' | 'video_raw' | 'image' | 'audio' | 'formula') => {
    const defaultTitle: Record<typeof type, string> = {
      text: `Ý chính ${lessonSections.length + 1}`,
      video: `Video minh họa ${lessonSections.length + 1}`,
      video_raw: `Video bài giảng ${lessonSections.length + 1}`,
      image: `Hình minh họa ${lessonSections.length + 1}`,
      audio: `Audio ghi nhớ ${lessonSections.length + 1}`,
      formula: `Công thức ${lessonSections.length + 1}`,
    };
    setLessonSections([...lessonSections, { title: defaultTitle[type], content: '', type }]);
  };

  const handleResetPassword = async (student: Student) => {
    const newPass = prompt(`Nhập mật khẩu mới cho tài khoản ${student.username}:`);
    if (newPass && newPass.trim() !== '') {
      onUpdateStudent({
        ...student,
        password: newPass.trim()
      });
      triggerToast(`Đã đổi mật khẩu thành công cho tài khoản ${student.username}`);
    }
  };

  if (!isAdmin && currentUser?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md">
          <span className="material-symbols-outlined text-4xl text-slate-400">lock</span>
          <h1 className="font-display font-black text-xl text-slate-800 mt-3">Không có quyền truy cập</h1>
          <p className="text-sm text-slate-500 mt-2">Khu vực này dành cho giáo viên và quản trị viên.</p>
          <button onClick={() => navigate('/')} className="mt-5 px-4 py-2 rounded-xl bg-[#0058be] text-white font-bold text-sm">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#0058be] text-3xl font-bold">admin_panel_settings</span>
            <div>
              <h3 className="font-display font-black text-lg text-[#0058be] leading-tight">Admin<br/>Workspace</h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2 leading-relaxed">
            Hệ thống quản lý nội dung và tài khoản tập trung.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {(isAdmin || currentUser?.role === 'teacher') && (
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
                activeTab === 'students' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined">badge</span>
              Quản lý học sinh
            </button>
          )}
          <button
            onClick={() => setActiveTab('subject')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
              activeTab === 'subject' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined">trophy</span>
            Tạo môn học
          </button>
          <button
            onClick={() => setActiveTab('lesson')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
              activeTab === 'lesson' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined">menu_book</span>
            Tạo bài học
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
              activeTab === 'quiz' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined">quiz</span>
            Quản lý trắc nghiệm
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
              activeTab === 'exam' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined">assignment</span>
            Tạo đề kiểm tra
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-3 ${
              activeTab === 'results' ? 'bg-blue-50 text-[#0058be]' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined">bar_chart</span>
            Kết quả public
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Về Trang chủ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen p-8 bg-[#f7f9fb]">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Toast Notification message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {successMsg}
            </div>
          )}

          {/* TAB: STUDENTS MANAGEMENT (Requested Feature) */}
          {(isAdmin || currentUser?.role === 'teacher') && activeTab === 'students' && (
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
                      {isAdmin && <option value="teacher">Giáo viên</option>}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Gán vào lớp giáo viên</label>
                    <select
                      value={newStudTeacherId}
                      onChange={(e) => setNewStudTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-lg px-3 py-2 text-xs outline-none"
                    >
                      <option value="">-- Không gán --</option>
                      {availableTeachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password block */}
                <div className="flex items-center gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="font-black text-slate-500">Mật khẩu ban đầu</label>
                    <input
                      type="text"
                      required
                      value={newStudPassword}
                      onChange={(e) => setNewStudPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-lg px-2.5 py-2.5 text-xs outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="ml-auto bg-[#0058be] hover:bg-blue-700 text-white font-display font-black text-xs px-5 py-3 rounded-xl transition-all shadow-[0_3px_0_0_#004395] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer self-end"
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
                              disabled={!isAdmin || student.id === 'stud-001'}
                              className="bg-slate-50 border border-slate-200 text-[10px] rounded px-1 py-1 outline-none font-bold mr-1"
                            >
                              <option value="student">Học sinh</option>
                              {isAdmin && <option value="teacher">Giáo viên</option>}
                              {isAdmin && <option value="admin">Admin</option>}
                            </select>

                            <select
                              value={student.teacherId || ''}
                              onChange={(e) => {
                                onUpdateStudent({ ...student, teacherId: e.target.value || undefined });
                                triggerToast(`Đã gán giáo viên phụ trách cho học sinh ${student.name}`);
                              }}
                              className="bg-slate-50 border border-slate-200 text-[10px] rounded px-1 py-1 outline-none mr-1"
                            >
                              <option value="">-- Không gán --</option>
                              {availableTeachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                            
                            <button
                              onClick={() => handleResetPassword(student)}
                              title="Đổi mật khẩu tài khoản"
                              className="w-8 h-8 rounded-full bg-slate-105 hover:bg-blue-100 text-[#0058be] border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">password</span>
                            </button>

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
            <form onSubmit={handleCreateLesson} className="space-y-6 font-sans text-xs">
              <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-800">Soạn bài học</h3>
                    <p className="text-xs text-slate-500 mt-1">Viết bài như một bài blog: tiêu đề, mở bài, nội dung, media và preview học sinh.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={lessonStatus}
                      onChange={(e) => setLessonStatus(e.target.value as any)}
                      className="h-10 bg-white border border-slate-200 focus:border-[#0058be] rounded-xl px-3 text-xs outline-none font-bold text-slate-700"
                    >
                      <option value="published">Xuất bản</option>
                      <option value="draft">Lưu nháp</option>
                      <option value="archived">Ẩn bài</option>
                    </select>
                    <button
                      type="submit"
                      className="h-10 px-5 bg-[#0058be] text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {editingLessonId ? 'Lưu thay đổi' : 'Đăng bài học'}
                      <span className="material-symbols-outlined text-sm">{editingLessonId ? 'save' : 'publish'}</span>
                    </button>
                    {editingLessonId && (
                      <button
                        type="button"
                        onClick={resetLessonForm}
                        className="h-10 px-4 bg-slate-200 text-slate-700 font-display font-bold rounded-xl shadow-[0_4px_0_0_#cbd5e1] hover:bg-slate-300 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Hủy
                        <span className="material-symbols-outlined text-sm">cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 p-5">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={selectedSubjId}
                          onChange={(e) => setSelectedSubjId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none font-bold text-slate-700"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={lessonChapter}
                          onChange={(e) => setLessonChapter(e.target.value)}
                          placeholder="Chương/Phần học"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none font-bold text-slate-700"
                        />
                      </div>

                      <input
                        type="text"
                        required
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="Tiêu đề bài học..."
                        className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-[#0058be] rounded-none px-0 py-4 text-3xl font-display font-black text-slate-900 outline-none placeholder:text-slate-300"
                      />

                      <textarea
                        value={lessonSummary}
                        onChange={(e) => setLessonSummary(e.target.value)}
                        placeholder="Viết đoạn mở bài ngắn để học sinh hiểu bài này nói về điều gì..."
                        className="w-full min-h-24 bg-slate-50 border border-slate-200 focus:border-[#0058be] rounded-2xl px-4 py-3 text-sm text-slate-700 outline-none resize-y leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <p className="font-display font-black text-sm text-slate-800">Ảnh/video đại diện</p>
                        <select
                          value={lessonMediaType}
                          onChange={(e) => setLessonMediaType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2.5 text-xs outline-none"
                        >
                          <option value="none">Không có media</option>
                          <option value="image">Hình ảnh</option>
                          <option value="youtube">YouTube</option>
                          <option value="video">Video MP4</option>
                        </select>
                        <input
                          type="url"
                          value={lessonMediaUrl}
                          onChange={(e) => setLessonMediaUrl(e.target.value)}
                          disabled={lessonMediaType === 'none'}
                          placeholder={lessonMediaType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : lessonMediaType === 'image' ? 'https://example.com/cover.jpg' : 'https://example.com/video.mp4'}
                          className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2.5 text-xs outline-none disabled:opacity-50"
                        />
                      </div>

                      <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center text-white">
                        {lessonMediaType === 'image' && lessonMediaUrl ? (
                          <img src={lessonMediaUrl} alt="Lesson preview" className="w-full h-full object-cover" />
                        ) : lessonMediaType === 'video' && lessonMediaUrl ? (
                          <video src={lessonMediaUrl} controls className="w-full h-full object-cover" />
                        ) : lessonMediaType === 'youtube' && lessonMediaUrl && getYoutubeId(lessonMediaUrl) ? (
                          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeId(lessonMediaUrl)}`} title="Lesson preview" allowFullScreen />
                        ) : (
                          <div className="text-center p-6">
                            <span className="material-symbols-outlined text-5xl text-white/70">image</span>
                            <p className="text-sm font-bold mt-2">Media đầu bài</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <label className="font-black text-amber-800 text-xs uppercase tracking-wider">Công thức / ghi nhớ nổi bật</label>
                      <input
                        type="text"
                        value={formulaInput}
                        onChange={(e) => setFormulaInput(e.target.value)}
                        placeholder="Ví dụ: $S_p = S_e$ hoặc $$m_{nt} \\approx m_p + m_n$$"
                        className="mt-2 w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div>
                            <h4 className="font-display font-black text-sm text-slate-800">Nội dung bài viết</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Thêm các block như khi viết một bài blog.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(['text', 'image', 'video', 'video_raw', 'audio', 'formula'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => addLessonBlock(type)}
                                className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#0058be] hover:text-[#0058be] text-[11px] font-bold"
                              >
                                + {lessonTypeLabel[type]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 p-4">
                        <aside className="bg-slate-50 border border-slate-200 rounded-xl p-3 h-fit lg:sticky lg:top-3">
                          <p className="font-display font-black text-xs text-slate-700 mb-3">Dàn ý</p>
                          <div className="space-y-2">
                            {lessonSections.map((sec, idx) => (
                              <button
                                key={`${sec.title}-${idx}`}
                                type="button"
                                onClick={() => document.getElementById(`lesson-section-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-100 hover:border-[#0058be]/30 text-xs font-bold text-slate-700"
                              >
                                <span className="text-[#0058be] mr-1">{idx + 1}.</span>
                                {sec.title || `Khối ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </aside>

                        <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2">
                          {lessonSections.map((sec, idx) => (
                            <div id={`lesson-section-${idx}`} key={idx} className="space-y-3 relative p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-[#0058be]/30 transition-colors group">
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx > 0) {
                              const newSecs = [...lessonSections];
                              [newSecs[idx - 1], newSecs[idx]] = [newSecs[idx], newSecs[idx - 1]];
                              setLessonSections(newSecs);
                            }
                          }}
                          disabled={idx === 0}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0058be] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Di chuyển lên"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx < lessonSections.length - 1) {
                              const newSecs = [...lessonSections];
                              [newSecs[idx], newSecs[idx + 1]] = [newSecs[idx + 1], newSecs[idx]];
                              setLessonSections(newSecs);
                            }
                          }}
                          disabled={idx === lessonSections.length - 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0058be] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Di chuyển xuống"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        {lessonSections.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => setLessonSections(lessonSections.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                            title="Xóa khối này"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-3 pr-28">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề khối</label>
                          <input 
                            type="text" 
                            value={sec.title} 
                            onChange={(e) => {
                              const newSecs = [...lessonSections];
                              newSecs[idx].title = e.target.value;
                              setLessonSections(newSecs);
                            }}
                            placeholder="Ví dụ: 1. Khái niệm cơ bản"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#0058be] shadow-sm"
                          />
                        </div>
                        <div className="w-32 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại nội dung</label>
                          <select 
                            value={sec.type || 'text'}
                            onChange={(e) => {
                              const newSecs = [...lessonSections];
                              newSecs[idx].type = e.target.value as any;
                              // Clear content when changing type to avoid rendering broken links
                              newSecs[idx].content = '';
                              setLessonSections(newSecs);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-[#0058be] shadow-sm"
                          >
                            <option value="text">📝 Văn bản</option>
                            <option value="video">🎥 Video (YouTube)</option>
                            <option value="video_raw">🎬 Video (MP4)</option>
                            <option value="image">🖼️ Hình ảnh</option>
                            <option value="audio">🎵 Âm thanh</option>
                            <option value="formula">ƒ Công thức</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {sec.type === 'video' ? 'Link YouTube' : sec.type === 'video_raw' ? 'Link Video (MP4)' : sec.type === 'image' ? 'Link hình ảnh (URL)' : sec.type === 'audio' ? 'Link Âm thanh (MP3)' : sec.type === 'formula' ? 'Nội dung công thức' : 'Nội dung văn bản'}
                        </label>
                        {sec.type === 'text' ? (
                          <RichTextField
                            value={sec.content}
                            onChange={(val) => {
                              const newSecs = [...lessonSections];
                              newSecs[idx].content = val;
                              setLessonSections(newSecs);
                            }}
                            placeholder="Nhập nội dung chi tiết bài học (có thể dùng HTML như <strong>, <ul>, <li>...)"
                          />
                        ) : sec.type === 'formula' ? (
                          <input
                            type="text"
                            required
                            value={sec.content}
                            onChange={(e) => {
                              const newSecs = [...lessonSections];
                              newSecs[idx].content = e.target.value;
                              setLessonSections(newSecs);
                            }}
                            placeholder="Ví dụ: $$m_{nt} \\approx m_p + m_n$$"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-[#0058be] shadow-sm"
                          />
                        ) : (
                          <input
                            type="url"
                            required
                            value={sec.content}
                            onChange={(e) => {
                              const newSecs = [...lessonSections];
                              newSecs[idx].content = e.target.value;
                              setLessonSections(newSecs);
                            }}
                            placeholder={sec.type === 'video' ? 'https://www.youtube.com/watch?v=...' : sec.type === 'video_raw' ? 'https://example.com/video.mp4' : sec.type === 'audio' ? 'https://example.com/audio.mp3' : 'https://example.com/image.jpg'}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0058be] shadow-sm"
                          />
                        )}
                        
                        {/* Video Preview */}
                        {sec.type === 'video' && sec.content && getYoutubeId(sec.content) && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black/5 aspect-video w-full max-w-md">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              src={`https://www.youtube.com/embed/${getYoutubeId(sec.content)}`} 
                              title="YouTube video player" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                        {/* Image Preview */}
                        {sec.type === 'image' && sec.content && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black/5 w-full max-w-md">
                            <img src={sec.content} alt="Preview" className="w-full h-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}
                        {/* Audio Preview */}
                        {sec.type === 'audio' && sec.content && (
                          <div className="mt-3 rounded-lg p-3 border border-slate-200 bg-black/5 w-full max-w-md">
                            <audio src={sec.content} controls className="w-full" />
                          </div>
                        )}
                        {/* Video Raw Preview */}
                        {sec.type === 'video_raw' && sec.content && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black/5 aspect-video w-full max-w-md">
                            <video src={sec.content} controls className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-4 xl:sticky xl:top-5 h-fit">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display font-black text-sm text-slate-800">Checklist</p>
                        <span className="text-[10px] font-black text-[#0058be]">{lessonCompleteness}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-[#0058be]" style={{ width: `${lessonCompleteness}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                        <div className="bg-white border border-slate-100 rounded-xl p-3">
                          <p className="font-black text-slate-800">{lessonSections.length}</p>
                          <p className="text-[10px] font-bold text-slate-500">Khối</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-3">
                          <p className="font-black text-slate-800">{lessonWordCount}</p>
                          <p className="text-[10px] font-bold text-slate-500">Từ</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-900 aspect-video flex items-center justify-center text-white">
                        {lessonMediaType === 'image' && lessonMediaUrl ? (
                          <img src={lessonMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : lessonMediaType === 'video' && lessonMediaUrl ? (
                          <video src={lessonMediaUrl} controls className="w-full h-full object-cover" />
                        ) : lessonMediaType === 'youtube' && lessonMediaUrl && getYoutubeId(lessonMediaUrl) ? (
                          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeId(lessonMediaUrl)}`} title="Preview" allowFullScreen />
                        ) : (
                          <div className="text-center p-5">
                            <span className="material-symbols-outlined text-4xl text-white/70">article</span>
                            <p className="text-xs font-bold mt-2">Preview bài học</p>
                          </div>
                        )}
                      </div>
                      <article className="p-5 space-y-4 max-h-[560px] overflow-y-auto">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-[#0058be]">{selectedLessonSubject?.name || 'Môn học'} • {lessonChapter || 'Chương học'}</p>
                          <h2 className="font-display font-black text-2xl text-slate-900 leading-tight mt-2">{lessonTitle || 'Tiêu đề bài học'}</h2>
                          <p className="text-sm text-slate-600 leading-relaxed mt-3">{lessonSummary || 'Đoạn mở bài sẽ xuất hiện ở đây.'}</p>
                        </div>

                        {formulaInput && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] uppercase font-black text-amber-700">Ghi nhớ</p>
                            <p className="font-mono font-bold text-amber-900 mt-1"><MathText text={formulaInput} /></p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {lessonSections.map((sec, idx) => (
                            <section key={`${sec.title}-${idx}`} className="border-t border-slate-100 pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0058be] text-xs font-black flex items-center justify-center">{idx + 1}</span>
                                <h3 className="font-display font-bold text-sm text-slate-800">{sec.title || `Khối ${idx + 1}`}</h3>
                              </div>
                              {(!sec.type || sec.type === 'text') && (
                                <div className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"><MathText text={sec.content || '<p>Nội dung đang soạn...</p>'} allowHtml /></div>
                              )}
                              {sec.type === 'formula' && <p className="font-mono text-sm font-bold bg-slate-50 border border-slate-100 rounded-lg p-3"><MathText text={sec.content || 'Công thức...'} /></p>}
                              {sec.type === 'image' && sec.content && <img src={sec.content} alt={sec.title} className="w-full rounded-xl border border-slate-100" />}
                              {sec.type === 'audio' && sec.content && <audio src={sec.content} controls className="w-full" />}
                              {sec.type === 'video_raw' && sec.content && <video src={sec.content} controls className="w-full rounded-xl aspect-video" />}
                              {sec.type === 'video' && sec.content && getYoutubeId(sec.content) && (
                                <div className="aspect-video rounded-xl overflow-hidden">
                                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeId(sec.content)}`} title={sec.title} allowFullScreen />
                                </div>
                              )}
                            </section>
                          ))}
                        </div>
                      </article>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Danh sách Bài học hiện tại</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scroll-hide">
                  {(() => {
                    const grouped: Record<string, Record<string, typeof lessons>> = {};
                    lessons.forEach(l => {
                      if (!grouped[l.subjectName]) grouped[l.subjectName] = {};
                      if (!grouped[l.subjectName][l.chapter]) grouped[l.subjectName][l.chapter] = [];
                      grouped[l.subjectName][l.chapter].push(l);
                    });
                    
                    if (lessons.length === 0) return <p className="text-slate-400 italic text-center">Chưa có bài học nào.</p>;

                    return Object.keys(grouped).map(subj => (
                      <div key={subj} className="mb-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-display font-bold text-[#0058be] flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">subject</span> {subj}
                        </div>
                        <div className="p-2 space-y-3">
                          {Object.keys(grouped[subj]).map(chap => (
                            <div key={chap} className="space-y-2">
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">{chap}</div>
                              {grouped[subj][chap].map(l => (
                                <div key={l.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors ml-2">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-700 text-sm leading-tight">{l.title}</span>
                                    <span className="text-[10px] text-slate-400 font-sans truncate max-w-[200px]">{l.summary}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditLesson(l)}
                                      title="Chỉnh sửa bài học"
                                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-base block">edit</span>
                                    </button>
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
                                      className="text-red-400 hover:bg-red-50 hover:text-red-600 p-1.5 rounded-md shrink-0 transition-colors"
                                    >
                                    <span className="material-symbols-outlined text-base block">delete</span>
                                  </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE QUIZ FORM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-800">Tạo đề kiểm tra</h3>
                    <p className="text-xs text-slate-500 mt-1">Chọn câu hỏi từ ngân hàng trắc nghiệm để tạo đề cho học sinh.</p>
                  </div>
                  {editingExamId && (
                    <button onClick={resetExamForm} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200">
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="space-y-1 md:col-span-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Tên đề</label>
                    <input
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Ví dụ: Kiểm tra Hóa học chương 1"
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Môn học</label>
                    <select
                      value={examSubjectId}
                      onChange={(e) => setExamSubjectId(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                    >
                      <option value="">Tổng hợp</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Thời gian phút</label>
                    <input
                      type="number"
                      min={1}
                      value={examDurationMinutes}
                      onChange={(e) => setExamDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-bold text-sm text-slate-800">Chọn câu hỏi ({examQuestionIds.length})</h4>
                    <button
                      type="button"
                      onClick={() => setExamQuestionIds(
                        quizzes
                          .filter(q => !examSubjectId || q.subjectId === examSubjectId || lessons.find(l => l.id === q.lessonId)?.subjectId === examSubjectId)
                          .slice(0, 10)
                          .map(q => q.id)
                      )}
                      className="text-xs font-bold text-[#0058be] hover:underline"
                    >
                      Chọn nhanh 10 câu
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {quizzes
                      .filter(q => !examSubjectId || q.subjectId === examSubjectId || lessons.find(l => l.id === q.lessonId)?.subjectId === examSubjectId)
                      .map(q => {
                        const selected = examQuestionIds.includes(q.id);
                        const lesson = lessons.find(l => l.id === q.lessonId);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => toggleExamQuestion(q.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-colors flex gap-3 ${
                              selected ? 'bg-blue-50 border-[#0058be]/30 text-[#0058be]' : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-[#0058be] text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <span className="material-symbols-outlined text-sm">{selected ? 'check' : 'add'}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs leading-relaxed"><MathText text={q.question} /></p>
                              <p className="text-[10px] text-slate-400 mt-1">{lesson?.title || q.subjectId || 'Chưa phân loại'}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => handleSaveExam('draft')} className="flex-1 h-11 bg-slate-200 text-slate-700 font-display font-bold rounded-xl shadow-[0_4px_0_0_#cbd5e1] hover:bg-slate-300 active:translate-y-[2px] active:shadow-none transition-all">
                    Lưu nháp
                  </button>
                  <button onClick={() => handleSaveExam('published')} className="flex-1 h-11 bg-[#0058be] text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all">
                    Xuất bản đề
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-display font-black text-lg text-slate-800 mb-4">Danh sách đề kiểm tra</h3>
                <div className="space-y-3">
                  {examTemplates.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">Chưa có đề kiểm tra nào.</p>
                  ) : examTemplates.map(exam => (
                    <div key={exam.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-slate-800">{exam.title}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            exam.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            exam.status === 'archived' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {exam.status === 'published' ? 'Đã xuất bản' : exam.status === 'archived' ? 'Đã ẩn' : 'Nháp'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{exam.questionIds.length} câu • {Math.round(exam.durationSeconds / 60)} phút</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {exam.status === 'published' && exam.shareSlug && (
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/public/quiz/${exam.shareSlug}`;
                              navigator.clipboard?.writeText(url);
                              triggerToast('Đã sao chép link làm bài public!');
                            }}
                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                            title="Sao chép link public"
                          >
                            <span className="material-symbols-outlined text-base">link</span>
                          </button>
                        )}
                        <button onClick={() => startEditExam(exam)} className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {exam.status !== 'archived' && (
                          <button onClick={() => saveExamTemplate({ ...exam, status: 'archived', updatedAt: new Date().toISOString() })} className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-base">archive</span>
                          </button>
                        )}
                        <button onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa đề này?')) deleteExamTemplate(exam.id);
                        }} className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-800">Kết quả làm bài public</h3>
                    <p className="text-xs text-slate-500 mt-1">Theo dõi các lượt làm bài từ link không cần đăng nhập.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0058be] text-xs font-black">{publicQuizAttempts.length} lượt nộp</span>
                </div>

                <div className="space-y-3">
                  {publicQuizAttempts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <span className="material-symbols-outlined text-5xl">inbox</span>
                      <p className="font-bold text-sm mt-2">Chưa có kết quả public nào.</p>
                    </div>
                  ) : publicQuizAttempts.map(attempt => {
                    const exam = examTemplates.find(e => e.id === attempt.examId || e.shareSlug === attempt.shareSlug);
                    return (
                      <div key={attempt.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h4 className="font-display font-bold text-sm text-slate-800">{attempt.displayName}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{exam?.title || attempt.shareSlug} • {attempt.className || 'Chưa nhập lớp'} • {new Date(attempt.submittedAt).toLocaleString('vi-VN')}</p>
                          {attempt.contact && <p className="text-[11px] text-slate-400 mt-0.5">{attempt.contact}</p>}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center shrink-0">
                          <div className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                            <p className="font-black text-[#0058be]">{attempt.score}/10</p>
                            <p className="text-[9px] font-bold text-slate-400">Điểm</p>
                          </div>
                          <div className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                            <p className="font-black text-emerald-600">{attempt.correctCount}</p>
                            <p className="text-[9px] font-bold text-slate-400">Đúng</p>
                          </div>
                          <div className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                            <p className="font-black text-rose-600">{attempt.wrongCount}</p>
                            <p className="text-[9px] font-bold text-slate-400">Sai</p>
                          </div>
                          <div className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                            <p className="font-black text-slate-600">{attempt.unansweredCount}</p>
                            <p className="text-[9px] font-bold text-slate-400">Trống</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <>
            <form onSubmit={handleCreateQuiz} className="space-y-5 font-sans text-xs">
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-800">Xưởng soạn trắc nghiệm</h3>
                    <p className="text-xs text-slate-500 mt-1">Soạn câu hỏi, phân loại độ khó và kiểm tra preview trước khi lưu vào ngân hàng.</p>
                  </div>
                  {!editingQuizId && (
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() => setQuizInputMode('single')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${quizInputMode === 'single' ? 'bg-white text-[#0058be] shadow-sm' : 'text-slate-500'}`}
                      >
                        Soạn từng câu
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizInputMode('bulk')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${quizInputMode === 'bulk' ? 'bg-white text-[#0058be] shadow-sm' : 'text-slate-500'}`}
                      >
                        Nhập hàng loạt
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 mt-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold text-slate-600 uppercase tracking-wider block">Thuộc bài học</label>
                        <select
                          value={quizLessonId}
                          onChange={(e) => setQuizLessonId(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none font-bold text-slate-700"
                        >
                          {lessons.map(l => (
                            <option key={l.id} value={l.id}>{l.title} ({l.subjectName})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 uppercase tracking-wider block">Độ khó mặc định</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none font-bold text-slate-700"
                        >
                          <option value="easy">Dễ</option>
                          <option value="medium">Vừa</option>
                          <option value="hard">Khó</option>
                        </select>
                      </div>
                    </div>

                    {quizInputMode === 'single' ? (
                      <>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 uppercase tracking-wider">Nội dung câu hỏi</label>
                          <textarea
                            required
                            value={quizQuestion}
                            onChange={(e) => setQuizQuestion(e.target.value)}
                            placeholder="Ví dụ: Giá trị của $x$ trong phương trình $2x + 3 = 7$ là bao nhiêu?"
                            className="w-full min-h-28 bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none resize-y leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {singleQuizOptions.map(option => (
                            <div key={option.key} className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <label className="font-bold text-slate-500">Đáp án {option.key}</label>
                                <button
                                  type="button"
                                  onClick={() => setCorrectKey(option.key)}
                                  className={`h-7 px-2 rounded-lg border text-[10px] font-black ${correctKey === option.key ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}
                                >
                                  {correctKey === option.key ? 'Đúng' : 'Chọn đúng'}
                                </button>
                              </div>
                              <input
                                type="text"
                                required={option.key === 'A' || option.key === 'B'}
                                value={option.value}
                                onChange={(e) => {
                                  if (option.key === 'A') setOptA(e.target.value);
                                  if (option.key === 'B') setOptB(e.target.value);
                                  if (option.key === 'C') setOptC(e.target.value);
                                  if (option.key === 'D') setOptD(e.target.value);
                                }}
                                placeholder={`Nhập đáp án ${option.key} (có thể dùng $x^2$, \\frac{a}{b})`}
                                className={`w-full rounded-xl px-3 py-3 text-xs outline-none border ${correctKey === option.key ? 'bg-emerald-50 border-emerald-300 focus:border-emerald-600 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200 focus:border-[#0058be]'}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 uppercase tracking-wider">Tags</label>
                            <input
                              type="text"
                              value={quizTags}
                              onChange={(e) => setQuizTags(e.target.value)}
                              placeholder="Ví dụ: nguyên tử, nhận biết, chương 1"
                              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 uppercase tracking-wider">Lời giải chi tiết</label>
                            <input
                              type="text"
                              value={explanation}
                              onChange={(e) => setExplanation(e.target.value)}
                              placeholder="Ví dụ: Chuyển vế được $2x = 4$, nên $x = 2$."
                              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="submit"
                            className="flex-1 h-11 bg-[#0058be] text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {editingQuizId ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
                            <span className="material-symbols-outlined text-sm">{editingQuizId ? 'save' : 'add_circle'}</span>
                          </button>
                          {editingQuizId && (
                            <button
                              type="button"
                              onClick={resetQuizForm}
                              className="flex-1 h-11 bg-slate-200 text-slate-700 font-display font-bold rounded-xl shadow-[0_4px_0_0_#cbd5e1] hover:bg-slate-300 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Hủy chỉnh sửa
                              <span className="material-symbols-outlined text-sm">cancel</span>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">
                          <div className="space-y-2">
                            <label className="font-bold text-slate-600 uppercase tracking-wider">Dán danh sách câu hỏi</label>
                            <textarea
                              value={bulkQuizText}
                              onChange={(e) => setBulkQuizText(e.target.value)}
                              placeholder={`Câu hỏi: Tính $\\frac{1}{2} + \\frac{1}{3}$.\nA. $\\frac{2}{5}$\nB. $\\frac{5}{6}$\nC. $\\frac{1}{6}$\nD. $1$\nĐáp án: B\nĐộ khó: medium\nTags: phân số, toán\nGiải thích: Quy đồng mẫu số: $\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$.`}
                              className="w-full h-72 bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl p-4 text-xs font-mono outline-none resize-y whitespace-pre-wrap leading-relaxed"
                            />
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed">
                            <p className="font-black text-slate-800 mb-2">Mẫu nhập</p>
                            <p>Câu hỏi: nội dung</p>
                            <p>A. đáp án A</p>
                            <p>B. đáp án B</p>
                            <p>C. đáp án C</p>
                            <p>D. đáp án D</p>
                            <p>Đáp án: A/B/C/D</p>
                            <p>Độ khó: easy/medium/hard</p>
                            <p>Tags: tag 1, tag 2</p>
                            <p>Giải thích: lời giải</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleBulkCreateQuiz}
                            className="flex-1 h-11 bg-indigo-600 text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#4338ca] hover:bg-indigo-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            Phân tích và xem trước <span className="material-symbols-outlined text-sm">preview</span>
                          </button>
                          {bulkPreviewQuizzes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setBulkPreviewQuizzes([])}
                              className="w-11 h-11 bg-slate-200 text-slate-600 font-bold rounded-xl shadow-[0_4px_0_0_#cbd5e1] hover:bg-slate-300 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center cursor-pointer"
                              title="Hủy xem trước"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                            </button>
                          )}
                        </div>

                        {bulkPreviewQuizzes.length > 0 && (
                          <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-4">
                            <h5 className="font-bold text-indigo-800 text-sm mb-3">Xem trước {bulkPreviewQuizzes.length} câu hỏi hợp lệ</h5>
                            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                              {bulkPreviewQuizzes.map((q, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <p className="font-bold text-slate-800 leading-relaxed">{idx + 1}. <MathText text={q.question} /></p>
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">{difficultyLabel[q.difficulty || 'medium']}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-2">
                                    {q.options.map(opt => (
                                      <div key={opt.key} className={`p-2 rounded border ${opt.key === q.correctKey ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                        {opt.key}. <MathText text={opt.text} />
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 mt-2">Giải thích: <MathText text={q.explanation} /></p>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={handleConfirmBulkQuizzes}
                              className="w-full h-11 mt-4 bg-emerald-600 text-white font-display font-bold rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Lưu {bulkPreviewQuizzes.length} câu hỏi <span className="material-symbols-outlined text-sm">save</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <aside className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-800">Preview học sinh</p>
                        <span className="text-[10px] font-black text-slate-500">{singleQuizCompleteness}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 mt-3 overflow-hidden">
                        <div className="h-full bg-[#0058be]" style={{ width: `${singleQuizCompleteness}%` }} />
                      </div>
                      <div className="mt-4 bg-white border border-slate-100 rounded-xl p-3">
                        <p className="text-sm font-bold text-slate-800 leading-relaxed"><MathText text={quizQuestion || 'Nội dung câu hỏi sẽ hiển thị tại đây.'} /></p>
                        <div className="space-y-2 mt-3">
                          {singleQuizOptions.map(option => (
                            <div key={option.key} className={`rounded-lg border px-3 py-2 text-xs ${correctKey === option.key ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                              {option.key}. <MathText text={option.value || `Đáp án ${option.key}`} />
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] text-slate-500 leading-relaxed"><MathText text={explanation || 'Lời giải giúp học sinh hiểu vì sao đáp án đúng.'} /></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                        <p className="font-black text-emerald-700">{quizDifficultyCounts.easy}</p>
                        <p className="text-[10px] font-bold text-emerald-700">Dễ</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                        <p className="font-black text-amber-700">{quizDifficultyCounts.medium}</p>
                        <p className="text-[10px] font-bold text-amber-700">Vừa</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                        <p className="font-black text-rose-700">{quizDifficultyCounts.hard}</p>
                        <p className="text-[10px] font-bold text-rose-700">Khó</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </form>

            {/* Quiz List */}
            <div className="mt-8 pt-6 border-t-2 border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">Ngân hàng câu hỏi của bài học</h4>
                  <p className="text-xs text-slate-500 mt-1">{selectedQuizLesson?.title || 'Chưa chọn bài học'} • {filteredQuizzesForSelectedLesson.length}/{quizzesForSelectedLesson.length} câu đang hiển thị</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-2 lg:w-[520px]">
                  <input
                    value={quizSearch}
                    onChange={(e) => setQuizSearch(e.target.value)}
                    placeholder="Tìm câu hỏi, đáp án, tag..."
                    className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-2.5 text-xs outline-none"
                  />
                  <select
                    value={quizDifficultyFilter}
                    onChange={(e) => setQuizDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                    className="w-full bg-white border border-slate-200 focus:border-[#0058be] rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-600"
                  >
                    <option value="all">Mọi độ khó</option>
                    <option value="easy">Dễ</option>
                    <option value="medium">Vừa</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scroll-hide">
                {(() => {
                  if (filteredQuizzesForSelectedLesson.length === 0) return <p className="text-slate-400 italic text-center py-8">Chưa có câu hỏi phù hợp với bộ lọc hiện tại.</p>;

                  return filteredQuizzesForSelectedLesson.map((q, idx) => (
                    <div key={q.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="font-bold text-[#0058be] mr-2">Câu {idx + 1}:</span>
                          <span className="font-semibold text-slate-700 text-sm leading-relaxed"><MathText text={q.question} /></span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">{difficultyLabel[q.difficulty || 'medium']}</span>
                            {(q.tags || []).map(tag => (
                              <span key={tag} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#0058be]">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditQuiz(q)}
                            title="Chỉnh sửa câu hỏi"
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base block">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
                                try {
                                  await deleteQuiz(q.id);
                                  triggerToast('Đã xóa thành công câu hỏi trắc nghiệm');
                                } catch (error: any) {
                                  console.error(error);
                                  alert(`Lỗi khi xóa câu hỏi: ${error.message}`);
                                }
                              }
                            }}
                            className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base block">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.options.map(opt => (
                          <div key={opt.key} className={`p-2 border rounded-lg ${opt.key === q.correctKey ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            {opt.key}. <MathText text={opt.text} />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2">Lời giải: <MathText text={q.explanation} /></p>
                    </div>
                  ));
                })()}
              </div>
            </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
