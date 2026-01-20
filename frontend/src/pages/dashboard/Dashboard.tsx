import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, LayoutDashboard, Beaker, UserCog, 
  UserCircle, Calendar, Users as UsersIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaboratories, getAssignments } from '../../api/resource.api';
import axios from 'axios';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ labs: 0, users: 0, myReservations: 0 });

  const role = user?.role || localStorage.getItem('role');
  const userDisplayName = user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || 'Usuario');
  const userEmail = user?.email?.toLowerCase().trim() || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [labsRes, assignRes] = await Promise.all([getLaboratories(), getAssignments()]);

        let usersCount = 0;
        if (role === 'ADMIN') {
          try {
            const usersRes = await axios.get('http://localhost:3000/users', {
              headers: { Authorization: `Bearer ${token}` }
            });
            usersCount = usersRes.data.length;
          } catch (e) { console.warn("403 Evitado"); }
        }

        const allAssignments = assignRes.data || [];
        const currentName = userDisplayName.toLowerCase().trim();

        // Filtrado por Correo o Nombre Parcial
        const myCount = role === 'ADMIN' 
          ? allAssignments.length 
          : allAssignments.filter((a: any) => {
              if (!a.teacherName) return false;
              const teacherField = a.teacherName.toLowerCase();
              return teacherField.includes(userEmail) || teacherField.includes(currentName);
            }).length;

        setStats({ labs: labsRes.data?.length || 0, users: usersCount, myReservations: myCount });
      } catch (error) { console.error("Error Dashboard:", error); }
    };
    fetchStats();
  }, [role, userDisplayName, userEmail]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg"><LayoutDashboard className="text-white" size={20} /></div>
          <span className="font-black text-xl tracking-tight text-blue-600 italic">LabOS</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black leading-tight">{userDisplayName}</p>
            <p className="text-[10px] uppercase font-black tracking-widest mt-1">
              <span className={`${role === 'ADMIN' ? 'text-purple-600 bg-purple-50' : 'text-blue-600 bg-blue-50'} px-2 py-0.5 rounded-md italic`}>
                {role === 'ADMIN' ? 'Administrador' : 'Docente'}
              </span>
            </p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-white border border-red-100 text-red-600 px-5 py-2.5 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black text-xs uppercase shadow-sm">
            <LogOut size={16} /> <span>Salir</span>
          </button>
        </div>
      </nav>

      <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-5xl font-black tracking-tighter italic uppercase">Panel Principal</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Beaker size={24}/></div>
            <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Laboratorios</p><p className="text-3xl font-black">{stats.labs}</p></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><UsersIcon size={24}/></div>
            <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Usuarios Sistema</p><p className="text-3xl font-black">{stats.users}</p></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600"><Calendar size={24}/></div>
            <div><p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{role === 'ADMIN' ? 'Reservas Totales' : 'Mis Reservas'}</p><p className="text-3xl font-black">{stats.myReservations}</p></div>
          </div>
        </div>
        
        {/* GRID DE 4 TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => navigate('/laboratorios')} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all"><Beaker className="text-blue-600 group-hover:text-white" size={32} /></div>
            <h3 className="font-black text-2xl mb-2 tracking-tight">Laboratorios</h3>
            <div className="text-blue-600 font-black text-xs uppercase tracking-widest italic">Gestionar →</div>
          </div>

          <div onClick={() => navigate('/asignaciones')} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-all"><Calendar className="text-green-600 group-hover:text-white" size={32} /></div>
            <h3 className="font-black text-2xl mb-2 tracking-tight">Asignaciones</h3>
            <div className="text-green-600 font-black text-xs uppercase tracking-widest italic">Ver Agenda →</div>
          </div>

          {role === 'ADMIN' && (
            <div onClick={() => navigate('/usuarios')} className="bg-gradient-to-br from-purple-700 to-indigo-900 p-8 rounded-[2rem] shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><UserCog className="text-white" size={32} /></div>
              <h3 className="font-black text-2xl text-white mb-2 tracking-tight">Usuarios</h3>
              <div className="text-white/80 font-black text-xs uppercase tracking-widest italic">Configurar →</div>
            </div>
          )}

          <div onClick={() => navigate('/perfil')} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-all"><UserCircle className="text-orange-600 group-hover:text-white" size={32} /></div>
            <h3 className="font-black text-2xl mb-2 tracking-tight">Mi Cuenta</h3>
            <div className="text-orange-600 font-black text-xs uppercase tracking-widest italic">Perfil y Clave →</div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;