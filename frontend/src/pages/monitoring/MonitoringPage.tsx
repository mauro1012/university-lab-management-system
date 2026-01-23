import React from 'react';
import { LabGrid } from '../../components/labs/LabGrid'; 
import { Activity, ArrowLeft, Clock, Wifi, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();

  const getLastUpdateTime = () => {
    return new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase">
            <ArrowLeft size={18} /> Volver
          </button>
        </header>

        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-2xl text-white"><Activity size={24} /></div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Monitoreo Real-Time</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <Wifi size={20} className="text-emerald-500" />
            <div className="text-sm font-bold text-slate-700 font-mono">{getLastUpdateTime()}</div>
          </div>
        </div>

        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
          <p className="text-sm text-indigo-900 font-medium">
            <strong>Arquitectura:</strong> Datos de NestJS y estados en vivo gestionados por Go con Redis.
          </p>
        </div>

        <section className="bg-white/40 rounded-[2.5rem] border border-slate-200/60 p-2 min-h-[500px]">
          <LabGrid />
        </section>
      </div>
    </div>
  );
};

export default MonitoringPage;