import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';

// Layout
import PageShell from './components/layout/PageShell';

// Pages
import LoginPage from './components/auth/LoginPage';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import LessonPage from './pages/LessonPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import SolutionsPage from './pages/SolutionsPage';
import ExamListPage from './pages/ExamListPage';
import ExamPage from './pages/ExamPage';
import WrongReviewPage from './pages/WrongReviewPage';
import AdminPage from './pages/AdminPage';
import PublicQuizPage from './pages/PublicQuizPage';

// Auth Guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0058be]"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public/quiz/:slug" element={<PublicQuizPage />} />
            
            {/* Protected Routes wrapped in PageShell */}
            <Route path="/" element={
              <RequireAuth>
                <PageShell />
              </RequireAuth>
            }>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="exams" element={<ExamListPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Routes without BottomNav (Full Screen) */}
            <Route path="/subject/:id" element={
              <RequireAuth>
                <SubjectDetailPage />
              </RequireAuth>
            } />
            <Route path="/lesson/:id" element={
              <RequireAuth>
                <LessonPage />
              </RequireAuth>
            } />
            <Route path="/quiz/:lessonId" element={
              <RequireAuth>
                <QuizPage />
              </RequireAuth>
            } />
            <Route path="/result" element={
              <RequireAuth>
                <ResultPage />
              </RequireAuth>
            } />
            <Route path="/attempts/:attemptId" element={
              <RequireAuth>
                <ResultPage />
              </RequireAuth>
            } />
            <Route path="/solutions" element={
              <RequireAuth>
                <SolutionsPage />
              </RequireAuth>
            } />
            <Route path="/attempts/:attemptId/solutions" element={
              <RequireAuth>
                <SolutionsPage />
              </RequireAuth>
            } />
            <Route path="/exam/:examId" element={
              <RequireAuth>
                <ExamPage />
              </RequireAuth>
            } />
            <Route path="/exam" element={<Navigate to="/exams" replace />} />
            <Route path="/review/wrong" element={
              <RequireAuth>
                <WrongReviewPage />
              </RequireAuth>
            } />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            } />
            
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
