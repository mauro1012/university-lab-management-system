import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login/Login';
import UserManagement from './pages/users/UserManagement';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import LaboratoryManagement from './pages/laboratories/LaboratoryManagement';
import AssignmentManagement from './pages/assignments/AssignmentManagement';


interface RouteProps {
  children: React.ReactNode;
}

// --- Componente para proteger rutas generales ---
const PrivateRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Evita redirecciones incorrectas mientras se verifica el token en localStorage
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando sesión...</div>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// --- Componente para proteger rutas exclusivas de ADMIN ---
const AdminRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  
  if (loading) return <div className="flex items-center justify-center h-screen">Verificando permisos...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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

        {/* Rutas Protegidas (Cualquier usuario logueado) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Perfil del usuario */}
        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* --- SECCIÓN ADMINISTRATIVA --- */}

        {/* Gestión de Usuarios */}
        <Route 
          path="/usuarios" 
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } 
        />
        
        {/* Gestión de Laboratorios */}
        <Route 
          path="/laboratorios" 
          element={
            <AdminRoute>
              <LaboratoryManagement />
            </AdminRoute>
          } 
        />

        {/* Gestión de Asignaciones (Reservas de horarios) */}
        { <Route 
          path="/asignaciones" 
          element={
            <AdminRoute>
              <AssignmentManagement />
            </AdminRoute>
          } 
        /> 
        }

        {/* Redirección global: Si la ruta no existe, va al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;