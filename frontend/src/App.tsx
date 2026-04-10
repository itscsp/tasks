import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Layout } from './components/Layout';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

import { Login } from './components/Login';

// Placeholder views
import { ProjectViewer as Project } from './components/ProjectViewer';
import { Inbox, Today, Upcoming } from './components/TaskViews';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
          <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
