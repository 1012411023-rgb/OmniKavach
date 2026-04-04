import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import WardDashboard from './pages/WardDashboard';
import PatientDetail from './pages/PatientDetail';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {isAuthenticated && <NavBar />}
      <main className={`${isAuthenticated ? 'flex-1 overflow-hidden min-h-0 mx-3 mb-3 rounded-2xl' : 'flex-1 overflow-hidden min-h-0'}`}
        style={isAuthenticated ? { background: 'var(--bg-secondary)', border: '1px solid var(--border)' } : {}}
      >
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/" element={<ProtectedRoute><WardDashboard /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
