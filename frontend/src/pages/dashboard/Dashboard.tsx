import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Beaker, Box, UserCog, UserCircle } from 'lucide-react';
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
            <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'Usuario'}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">
              {role === 'ADMIN' ? (
                <span className="text-purple-600">Administrador</span>
              ) : (
                <span className="text-blue-600">Profesor</span>
              )}
            </p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido al Panel de Control</h2>
          <p className="text-gray-500 mt-1">Selecciona una opción para gestionar los recursos del laboratorio.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta de Laboratorios */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Beaker className="text-blue-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Laboratorios</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Gestiona los espacios físicos, horarios y disponibilidad en tiempo real.</p>
            <button className="mt-6 flex items-center text-blue-600 font-bold text-sm hover:gap-2 transition-all">
              Ver detalles <span className="ml-1">→</span>
            </button>
          </div>

          {/* Tarjeta de Inventario */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all cursor-pointer group">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Box className="text-green-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Inventario</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Control total de reactivos, equipos médicos y materiales de laboratorio.</p>
            <button className="mt-6 flex items-center text-green-600 font-bold text-sm hover:gap-2 transition-all">
              Ver detalles <span className="ml-1">→</span>
            </button>
          </div>

          {/* Tarjeta de Perfil - ACCESIBLE PARA TODOS */}
          <div 
            onClick={() => navigate('/perfil')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group"
          >
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <UserCircle className="text-orange-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Mi Perfil</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Actualiza tu información personal y gestiona la seguridad de tu cuenta.</p>
            <button className="mt-6 flex items-center text-orange-600 font-bold text-sm hover:gap-2 transition-all">
              Gestionar cuenta <span className="ml-1">→</span>
            </button>
          </div>

          {/* Tarjeta de Usuarios - SOLO PARA ADMIN */}
          {role === 'ADMIN' && (
            <div 
              onClick={() => navigate('/usuarios')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer group lg:col-span-1"
            >
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <UserCog className="text-purple-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">Gestión de Usuarios</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Administra las cuentas de profesores y controla los permisos del sistema.</p>
              <button className="mt-6 flex items-center text-purple-600 font-bold text-sm hover:gap-2 transition-all">
                Configurar usuarios <span className="ml-1">→</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;