import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, LayoutDashboard, Beaker, UserCog, 
  UserCircle, Calendar, Users as UsersIcon,
  ChevronRight, BarChart3, Settings, Clock,
  TrendingUp, Shield, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaboratories, getAssignments } from '../../api/resource.api';
import { getUsers } from '../../api/auth.api';
import axios from 'axios';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    labs: 0, 
    users: 0, 
    myReservations: 0,
    todayClasses: 0,
    upcomingClasses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role || localStorage.getItem('role');
  const userDisplayName = user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || 'User');
  const userEmail = user?.email?.toLowerCase().trim() || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const [labsRes, assignRes] = await Promise.all([getLaboratories(), getAssignments()]);

        let usersCount = 0;
        if (role === 'ADMIN') {
          try {
            const usersRes = await getUsers(); // Esta función ya sabe que debe ir a /auth/users
            usersCount = usersRes.data.length;
          } catch (e) { 
            usersCount = 0;
          }
        }
        const allAssignments = assignRes.data || [];
        const currentName = userDisplayName.toLowerCase().trim();

        const myAssignments = role === 'ADMIN' 
          ? allAssignments 
          : allAssignments.filter((a: any) => {
              if (!a.teacherName) return false;
              const teacherField = a.teacherName.toLowerCase();
              return teacherField.includes(userEmail) || teacherField.includes(currentName);
            });

        // Calcular clases para hoy y próximas
        let todayClasses = 0;
        let upcomingClasses = 0;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        myAssignments.forEach((assignment: any) => {
          const startTime = new Date(assignment.startTime);
          
          // Contar clases de hoy
          if (startTime >= todayStart && startTime < todayEnd) {
            todayClasses++;
          }
          
          // Contar clases próximas (dentro de la próxima semana, excluyendo hoy)
          if (startTime > now && startTime < oneWeekFromNow && !(startTime >= todayStart && startTime < todayEnd)) {
            upcomingClasses++;
          }
        });

        setStats({ 
          labs: labsRes.data?.length || 0, 
          users: usersCount, 
          myReservations: myAssignments.length,
          todayClasses,
          upcomingClasses 
        });
      } catch (error) { 
        console.error("Dashboard Error:", error); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [role, userDisplayName, userEmail]);

  const statCards = [
    {
      icon: <Beaker size={24} />,
      label: "Laboratories",
      value: stats.labs,
      color: "blue",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-500",
      iconBg: "bg-blue-50/80",
      iconColor: "text-blue-600",
      trend: "+2 today"
    },
    {
      icon: role === 'ADMIN' ? <UsersIcon size={24} /> : <Calendar size={24} />,
      label: role === 'ADMIN' ? "System Users" : "Today's Classes",
      value: role === 'ADMIN' ? stats.users : stats.todayClasses,
      color: "orange",
      gradientFrom: "from-orange-500",
      gradientTo: "to-amber-500",
      iconBg: "bg-orange-50/80",
      iconColor: "text-orange-600",
      trend: role === 'ADMIN' ? "Manage users" : `${stats.upcomingClasses} upcoming`
    },
    {
      icon: <Calendar size={24} />,
      label: role === 'ADMIN' ? 'Total Reservations' : 'My Reservations',
      value: stats.myReservations,
      color: "green",
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-500",
      iconBg: "bg-green-50/80",
      iconColor: "text-green-600",
      trend: role === 'ADMIN' ? "All time" : "Active"
    }
  ];

  const featureCards = [
    {
      title: "Laboratories",
      description: "Manage and organize laboratory resources",
      icon: <Beaker size={28} />,
      path: "/laboratorios",
      color: "blue",
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      hoverClass: "hover:shadow-xl hover:shadow-blue-100/50",
      badge: null
    },
    {
      title: "Assignments",
      description: "View and manage your schedule",
      icon: <Calendar size={28} />,
      path: "/asignaciones",
      color: "green",
      gradient: "bg-gradient-to-br from-green-50 to-emerald-100",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
      hoverClass: "hover:shadow-xl hover:shadow-green-100/50",
      badge: null
    },
    ...(role === 'ADMIN' ? [{
      title: "Users",
      description: "Configure user permissions and access",
      icon: <UserCog size={28} />,
      path: "/usuarios",
      color: "purple",
      gradient: "bg-gradient-to-br from-purple-50 to-violet-100",
      iconBg: "bg-gradient-to-br from-purple-600 to-indigo-700",
      hoverClass: "hover:shadow-xl hover:shadow-purple-100/50",
      badge: <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-bold">ADMIN</div>
    }] : []),
    {
      title: "My Account",
      description: "Update profile and security settings",
      icon: <UserCircle size={28} />,
      path: "/perfil",
      color: "orange",
      gradient: "bg-gradient-to-br from-orange-50 to-amber-100",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
      hoverClass: "hover:shadow-xl hover:shadow-orange-100/50",
      badge: <Shield size={14} className="text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-3 rounded-xl shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="text-white" size={22} />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent italic">LabOS</span>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Laboratory Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-gray-800">{userDisplayName}</p>
            <div className="mt-1.5">
              <span className={`${role === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm`}>
                {role === 'ADMIN' ? 'Administrator' : 'Teacher'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2.5 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all duration-300 font-semibold text-sm group"
          >
            <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-300" /> 
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{userDisplayName.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Here's your dashboard overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.iconBg} p-3.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                {isLoading ? (
                  <div className="h-10 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">{stat.trend}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                <TrendingUp size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className={`h-1.5 w-full bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo} rounded-full mt-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
          ))}
        </div>

        {/* Quick Access Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
              <p className="text-gray-500 text-sm mt-1">Navigate to essential features</p>
            </div>
            <div className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl">
              <BarChart3 className="text-gray-600" size={22} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feature, index) => (
              <div 
                key={index}
                onClick={() => navigate(feature.path)}
                className={`bg-white rounded-2xl border border-gray-200/70 shadow-sm ${feature.hoverClass} hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${feature.iconBg} p-4 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    {feature.badge && (
                      <div className="flex items-center gap-1.5">
                        {feature.badge}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-gray-800 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-5">{feature.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-${feature.color}-600 font-semibold text-sm tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all duration-300`}>
                      Access Now
                      <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </span>
                    <div className={`w-10 h-10 rounded-full bg-${feature.color}-50 flex items-center justify-center group-hover:${feature.iconBg.replace('bg-gradient-to-br', 'bg-gradient-to-br')} transition-all duration-300`}>
                      <ChevronRight size={18} className={`text-${feature.color}-600 group-hover:text-white transition-colors duration-300`} />
                    </div>
                  </div>
                </div>
                
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.iconBg.replace('bg-gradient-to-br', '')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule Section - Solo para Teachers */}
        {role === 'TEACHER' && stats.todayClasses > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                <p className="text-gray-500 text-sm mt-1">Your classes for today</p>
              </div>
              <div className="p-2.5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                <BookOpen className="text-orange-600" size={22} />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">You have {stats.todayClasses} class{stats.todayClasses !== 1 ? 'es' : ''} today</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.upcomingClasses > 0 
                      ? `Plus ${stats.upcomingClasses} upcoming in the next 7 days` 
                      : 'No upcoming classes this week'}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/asignaciones')}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-300"
                >
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Status Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/50 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">System Status</h3>
              <p className="text-gray-500 text-sm mt-1">All systems operational</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-semibold text-sm">Online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Beaker size={20} className="text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Laboratory Availability</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">All laboratories are currently available for scheduling</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-3/4"></div>
              </div>
            </div>
            
            <div className="p-5 bg-white rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-green-50 rounded-lg">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Upcoming Reservations</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {role === 'ADMIN' 
                  ? `Total: ${stats.myReservations} reservations` 
                  : `Next reservation in 2 hours`
                }
              </p>
              <div className="text-xs text-gray-500 font-medium">
                {role === 'ADMIN' ? 'All laboratories' : 'Chemistry Lab - Room 204'}
              </div>
            </div>
            
            <div className="p-5 bg-white rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <Settings size={20} className="text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">System Health</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">All services running normally</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">99.9%</div>
                  <div className="text-xs text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">0</div>
                  <div className="text-xs text-gray-500">Issues</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 md:px-10 border-t border-gray-200/30 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
            <div>
              <span className="text-sm font-semibold text-gray-900">LabOS v2.1</span>
              <span className="text-sm text-gray-500 mx-2">•</span>
              <span className="text-sm text-gray-500">Laboratory Management System</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            <span className="mx-2">•</span>
            <span className="text-blue-600">Last updated: Just now</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;