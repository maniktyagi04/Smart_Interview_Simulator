import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageQuestions from './pages/ManageQuestions';
import InterviewHistory from './pages/InterviewHistory';
import InterviewSessionPage from './pages/InterviewSessionPage';
import SessionFeedbackPage from './pages/SessionFeedbackPage';
import StartInterviewPage from './pages/StartInterviewPage';
import HistoryPage from './pages/HistoryPage';
import FeedbackReportsPage from './pages/FeedbackReportsPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'STUDENT' | 'ADMIN' }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          } />

           <Route path="/start-interview" element={
            <ProtectedRoute role="STUDENT">
              <Navigate to="/interview/new" replace />
            </ProtectedRoute>
          } />

           <Route path="/interview/new" element={
            <ProtectedRoute role="STUDENT">
              <StartInterviewPage />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute role="STUDENT">
               <HistoryPage />
            </ProtectedRoute>
          } />

           <Route path="/feedback-reports" element={
            <ProtectedRoute role="STUDENT">
               <FeedbackReportsPage />
            </ProtectedRoute>
          } />

           <Route path="/analytics" element={
            <ProtectedRoute role="STUDENT">
               <PerformanceAnalyticsPage />
            </ProtectedRoute>
          } />


          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />


          <Route path="/admin/students" element={
            <ProtectedRoute role="ADMIN">
              <ManageStudents />
            </ProtectedRoute>
          } />

          <Route path="/admin/questions" element={
            <ProtectedRoute role="ADMIN">
              <ManageQuestions />
            </ProtectedRoute>
          } />

          <Route path="/admin/history" element={
            <ProtectedRoute role="ADMIN">
              <InterviewHistory />
            </ProtectedRoute>
          } />

          <Route path="/admin/feedback" element={
            <ProtectedRoute role="ADMIN">
              <FeedbackReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute role="ADMIN">
              <PerformanceAnalyticsPage />
            </ProtectedRoute>
          } />

          <Route path="/interview/:id" element={
            <ProtectedRoute role="STUDENT">
              <InterviewSessionPage />
            </ProtectedRoute>
          } />

          <Route path="/feedback/:id" element={
            <ProtectedRoute role="STUDENT">
              <SessionFeedbackPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute role="STUDENT">
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/profile" element={
            <ProtectedRoute role="ADMIN">
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
};

export default App;
