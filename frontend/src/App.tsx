import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login/Login';
import UserManagement from './pages/users/UserManagement';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import LaboratoryManagement from './pages/laboratories/LaboratoryManagement';
import AssignmentManagement from './pages/assignments/AssignmentManagement';
import MonitoringPage from './pages/monitoring/MonitoringPage'; 

interface RouteProps {
  children: React.ReactNode;
}

// --- Componente para proteger rutas generales (ADMIN y TEACHER) ---
const PrivateRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando sesión...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// --- Componente para proteger rutas EXCLUSIVAS de ADMIN ---
const AdminRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  
  if (loading) return <div className="flex items-center justify-center h-screen">Verificando permisos...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Solo el ADMIN pasa de aquí
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* --- RUTAS PARA AMBOS (ADMIN Y TEACHER) --- */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Live Monitoring (Monitoreo en tiempo real) */}
        <Route 
          path="/monitoring" 
          element={
            <PrivateRoute>
              <MonitoringPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/laboratorios" 
          element={
            <PrivateRoute>
              <LaboratoryManagement />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/asignaciones" 
          element={
            <PrivateRoute>
              <AssignmentManagement />
            </PrivateRoute>
          } 
        />

        {/* --- SECCIÓN EXCLUSIVA PARA ADMIN --- */}
        <Route 
          path="/usuarios" 
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } 
        />

        {/* Redirección global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;