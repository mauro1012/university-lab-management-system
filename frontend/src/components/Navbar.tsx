import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'; 

export const Navbar = () => {
  const { logout, user } = useAuth();

  // PRIORIDAD DE ROL:
  // 1. Usamos el rol que viene del estado global (user.role)
  // 2. Si el estado es null (al refrescar), intentamos leer localStorage
  // 3. Por último, si no hay nada, 'TEACHER' por seguridad.
  const role = user?.role || localStorage.getItem('role') || 'TEACHER';

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center w-full">
      {/* Lado Izquierdo: Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner">
          <div className="text-white font-bold text-sm">UL</div>
        </div>
        <span className="font-bold text-gray-800 hidden md:block tracking-tight">
          University Lab Management
        </span>
      </div>

      {/* Lado Derecho: Perfil y Logout */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-gray-600 border-r pr-6 border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-gray-500 mb-0.5">Sesión iniciada</span>
            <span className="text-sm font-bold text-gray-900 leading-none">
              {user?.email || 'Usuario'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {role === 'ADMIN' ? (
              <ShieldCheck size={20} className="text-purple-600" />
            ) : (
              <UserIcon size={20} className="text-blue-600" />
            )}
            
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm ${
              role === 'ADMIN' 
                ? 'bg-purple-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {role}
            </span>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all text-sm font-bold group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};