import React, { useState, useEffect } from 'react';
import { LabGrid } from '../../components/labs/LabGrid'; 
import { Activity, ArrowLeft, Wifi, Database, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reloj en tiempo real para el header
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('es-EC', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Navegación Superior */}
        <header className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase transition-all hover:translate-x-1"
          >
            <ArrowLeft size={18} /> Volver al Dashboard
          </button>
        </header>

        {/* Encabezado Principal */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Activity size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                Real-Time Monitoring
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Control de estado de laboratorios vía Redis</p>
          </div>
          
          {/* Status Badge & Clock */}
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Gateway Live</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="text-sm font-bold text-slate-700 font-mono">
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Indicadores de Arquitectura (Para la defensa) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Database size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">State Engine</p>
              <p className="text-sm font-bold text-slate-700">Redis In-Memory Database</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Server size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Status Service</p>
              <p className="text-sm font-bold text-slate-700">Go (Golang) Microservice</p>
            </div>
          </div>
        </div>

        {/* Contenedor del Grid de Laboratorios */}
        <section className="bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-2 min-h-[500px]">
          <LabGrid />
        </section>

      </div>
    </div>
  );
};

export default MonitoringPage;