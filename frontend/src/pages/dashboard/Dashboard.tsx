import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, LayoutDashboard, Beaker, UserCog, 
  UserCircle, Calendar, Users as UsersIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaboratories } from '../../api/resource.api';
import axios from 'axios';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ labs: 0, users: 0 });
  const role = user?.role || localStorage.getItem('role');

  // Carga de datos reales para los mini-widgets
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const labsRes = await getLaboratories();
        // Para usuarios, consultamos el microservicio de Auth (3000)
        const token = localStorage.getItem('token');
        const usersRes = await axios.get('http://localhost:3000/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats({
          labs: labsRes.data.length,
          users: usersRes.data.length
        });
      } catch (error) {
        console.error("Error cargando estadísticas reales:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar Superior */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="font-black text-xl text-gray-800 tracking-tight">LabOS</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-tight">
               {user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Usuario')}
            </p>
            <p className="text-[10px] uppercase font-black tracking-widest leading-none mt-1">
              {role === 'ADMIN' ? (
                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md italic">Administrador</span>
              ) : (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md italic">Profesor</span>
              )}
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="group flex items-center gap-2 bg-white border border-red-100 text-red-600 px-5 py-2.5 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
            Panel Principal
          </h2>
          <p className="text-gray-400 mt-2 text-lg font-medium">
            Gestiona los recursos de infraestructura y personal del campus.
          </p>
        </header>

        {/* Sección de Estadísticas Reales (Mini-widgets) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-inner"><Beaker size={24}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Laboratorios</p>
              <p className="text-3xl font-black text-gray-800">{stats.labs}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 shadow-inner"><UsersIcon size={24}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Personal Total</p>
              <p className="text-3xl font-black text-gray-800">{stats.users}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600 shadow-inner"><Calendar size={24}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Reservas Activas</p>
              <p className="text-3xl font-black text-gray-800">0</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta de Laboratorios */}
          <div 
            onClick={() => navigate('/laboratorios')}
            className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
          >
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              <Beaker className="text-blue-600 group-hover:text-white transition-colors" size={40} />
            </div>
            <h3 className="font-black text-3xl text-gray-800 mb-4 tracking-tight">Laboratorios</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
              Administración de infraestructura: registro de ubicación, capacidad instalada y estado actual.
            </p>
            <div className="flex items-center text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
              Explorar Recursos <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>

          {/* Tarjeta de Asignaciones (NUEVA) */}
          <div 
            onClick={() => navigate('/asignaciones')}
            className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
          >
            <div className="bg-green-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-green-600 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              <Calendar className="text-green-600 group-hover:text-white transition-colors" size={40} />
            </div>
            <h3 className="font-black text-3xl text-gray-800 mb-4 tracking-tight">Asignaciones</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
              Gestión de horarios: asigna laboratorios a profesores y controla el calendario académico.
            </p>
            <div className="flex items-center text-green-600 font-black text-xs uppercase tracking-[0.2em]">
              Gestionar Horarios <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>

          {/* Tarjeta de Perfil */}
          <div 
            onClick={() => navigate('/perfil')}
            className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
          >
            <div className="bg-orange-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              <UserCircle className="text-orange-600 group-hover:text-white transition-colors" size={40} />
            </div>
            <h3 className="font-black text-3xl text-gray-800 mb-4 tracking-tight">Mi Perfil</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
              Configuración de cuenta, actualización de datos personales y seguridad de acceso.
            </p>
            <div className="flex items-center text-orange-600 font-black text-xs uppercase tracking-[0.2em]">
              Mi Cuenta <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>

          {/* Tarjeta de Usuarios - SOLO PARA ADMIN */}
          {role === 'ADMIN' && (
            <div 
              onClick={() => navigate('/usuarios')}
              className="bg-gradient-to-br from-purple-700 to-indigo-900 p-10 rounded-[2.5rem] shadow-xl hover:shadow-purple-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer group md:col-span-2 lg:col-span-1"
            >
              <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <UserCog className="text-white" size={40} />
              </div>
              <h3 className="font-black text-3xl text-white mb-4 tracking-tight">Usuarios</h3>
              <p className="text-purple-100/60 text-sm font-medium leading-relaxed mb-8">
                Control de acceso: gestión de roles y permisos para el personal docente y administrativo.
              </p>
              <div className="flex items-center text-white font-black text-xs uppercase tracking-[0.2em]">
                Administrar <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;