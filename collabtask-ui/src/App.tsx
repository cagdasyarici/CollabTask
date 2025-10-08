// React 17+ JSX transform ile import gerekmiyor
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { KanbanPage } from './pages/KanbanPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/projects" 
          element={isAuthenticated ? <Layout><ProjectsPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/kanban" 
          element={isAuthenticated ? <Layout><KanbanPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/users" 
          element={isAuthenticated ? <Layout><UserManagementPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" replace />} 
        />
        
        {/* Home Route - Public but shows different content based on auth */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Layout showNavbar={false}><HomePage /></Layout>} 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App
