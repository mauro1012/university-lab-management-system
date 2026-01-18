import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck, Settings } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { logout, user } = useAuth();

  // Prioridad de rol para consistencia visual
  const role = user?.role || localStorage.getItem('role') || 'TEACHER';

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center w-full">
      {/* Lado Izquierdo: Logo y Link al Dashboard */}
      <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner">
          <div className="text-white font-bold text-sm">UL</div>
        </div>
        <span className="font-bold text-gray-800 hidden md:block tracking-tight">
          University Lab Management
        </span>
      </Link>

      {/* Lado Derecho: Perfil y Logout */}
      <div className="flex items-center gap-4">
        
        {/* SECCIÓN DE PERFIL: Envolvemos en Link hacia /perfil */}
        <Link 
          to="/perfil" 
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
          title="Ver mi perfil y seguridad"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Mi Cuenta</span>
            <span className="text-sm font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
              {user?.email || 'Usuario'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 relative">
            {role === 'ADMIN' ? (
              <ShieldCheck size={20} className="text-purple-600" />
            ) : (
              <UserIcon size={20} className="text-blue-600" />
            )}
            
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm ${
              role === 'ADMIN' 
                ? 'bg-purple-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {role}
            </span>
          </div>
        </Link>

        {/* Separador visual */}
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
        
        {/* Botón Salir */}
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all text-sm font-bold group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
};