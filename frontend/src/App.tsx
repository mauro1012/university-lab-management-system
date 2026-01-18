import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login/Login';
import UserManagement from './pages/users/UserManagement';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';

interface RouteProps {
  children: React.ReactNode;
}

// --- Componente para proteger rutas generales ---
const PrivateRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// --- Componente para proteger rutas exclusivas de ADMIN ---
const AdminRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth();
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
        
        {/* CAMBIO CLAVE: Ahora coincide con navigate('/perfil') */}
        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Ruta Protegida (SOLO ADMIN) */}
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