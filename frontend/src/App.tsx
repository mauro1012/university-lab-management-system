import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login/Login';
import UserManagement from './pages/users/UserManagement';
import Dashboard from './pages/dashboard/Dashboard';

interface RouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Rutas Protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* CORRECCIÓN: Ruta de Usuarios dentro de Routes y bien escrita */}
        <Route 
          path="/usuarios" 
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          } 
        />

        {/* Redirección global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;