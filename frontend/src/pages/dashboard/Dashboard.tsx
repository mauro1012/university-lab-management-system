import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Beaker, Box, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || localStorage.getItem('role');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Superior */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" />
          <span className="font-bold text-xl text-gray-800">Lab Management</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.email || 'Usuario'}</p>
            <p className="text-xs text-gray-500 uppercase font-bold text-blue-600">{role}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido al Panel de Control</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta de Laboratorios */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Beaker className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">Laboratorios</h3>
            <p className="text-gray-500 text-sm mt-1">Gestiona los espacios físicos y su disponibilidad.</p>
            <button className="mt-4 text-blue-600 font-medium hover:underline text-sm">Ver detalles →</button>
          </div>

          {/* Tarjeta de Inventario */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Box className="text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">Inventario</h3>
            <p className="text-gray-500 text-sm mt-1">Control de reactivos, equipos y materiales.</p>
            <button className="mt-4 text-green-600 font-medium hover:underline text-sm">Ver detalles →</button>
          </div>

          {/* CORRECCIÓN: Tarjeta de Usuarios SOLO para ADMIN */}
          {role === 'ADMIN' && (
            <div 
              onClick={() => navigate('/usuarios')}
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCog className="text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Gestión de Usuarios</h3>
              <p className="text-gray-500 text-sm mt-1">Registrar profesores y asignar roles al sistema.</p>
              <button className="mt-4 text-purple-600 font-medium hover:underline text-sm">Gestionar →</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;