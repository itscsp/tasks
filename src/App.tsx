import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProjectViewer as Project } from './components/ProjectViewer';
import { Inbox, Today, Upcoming } from './components/TaskViews';
import { FullCalendarPage } from './components/FullCalendarPage';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e]">
        <div className="w-10 h-10 border-4 border-[#333] border-t-[#db4c3f] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes wrapped in Layout */}
        <Route path="/" element={isAuthenticated ? <Layout><Inbox /></Layout> : <Navigate to="/login" />} />
        <Route path="/today" element={isAuthenticated ? <Layout><Today /></Layout> : <Navigate to="/login" />} />
        <Route path="/upcoming" element={isAuthenticated ? <Layout><Upcoming /></Layout> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <Layout><FullCalendarPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/project/:id" element={isAuthenticated ? <Layout><Project /></Layout> : <Navigate to="/login" />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
