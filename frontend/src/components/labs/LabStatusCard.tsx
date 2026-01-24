import React, { useState } from 'react';
import { useLabStatus } from '../../hooks/useLabStatus';
import { statusService } from '../../services/statusService';
import { Clock, Users, BookOpen, RefreshCw, LogOut, Play, ShieldCheck } from 'lucide-react';

// --- LÓGICA DE TIEMPO ESTÁNDAR ECUADOR (UTC-5) ---
const utcToEcuadorTime = (utcDate: Date): Date => {
  const ecuadorOffset = -5 * 60; // -5 horas en minutos
  return new Date(utcDate.getTime() + (ecuadorOffset - utcDate.getTimezoneOffset()) * 60000);
};

const formatEcuadorTime = (isoString: string): string => {
  if (!isoString) return '--:--';
  try {
    const dateUTC = new Date(isoString);
    const dateEcu = utcToEcuadorTime(dateUTC);
    return dateEcu.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Guayaquil'
    });
  } catch (e) {
    return '--:--';
  }
};

interface Props {
  labId: string; 
  labName: string; 
  subjectName: string;
  capacity: number; 
  startTime: string; // ISO String desde el backend
  endTime: string;   // ISO String desde el backend
  date: string;
}

export const LabStatusCard: React.FC<Props> = ({ 
  labId, labName, subjectName, capacity, startTime, endTime, date 
}) => {
  const { status, time_left_minutes, updateStatus } = useLabStatus(labId);
  const [loading, setLoading] = useState(false);

  const isBusy = status === 'BUSY';
  
  // FUNCIÓN CORREGIDA: Calcula duración basada en hora real de Ecuador
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener "Ahora" real en Ecuador
      const nowInEcuador = utcToEcuadorTime(new Date());
      
      // 2. Convertir hora de fin programada a objeto Date de Ecuador
      const targetTimeUTC = new Date(endTime);
      const targetTimeEcuador = utcToEcuadorTime(targetTimeUTC);

      // 3. Validar si la clase ya terminó
      if (targetTimeEcuador.getTime() <= nowInEcuador.getTime()) {
        alert("Cannot start: The scheduled end time for this class has already passed in Ecuador time.");
        return;
      }

      // 4. Calcular diferencia exacta en minutos
      const diffInMinutes = Math.floor((targetTimeEcuador.getTime() - nowInEcuador.getTime()) / 60000);
      const finalDuration = Math.max(1, diffInMinutes);
      
      // 5. Enviar duración pura a Go/Redis
      await statusService.checkInLab(labId, finalDuration); 
      await updateStatus();
      
    } catch (e) { 
      console.error(e);
      alert("Error connecting to the Status Service (Go)."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCheckOut = async () => {
    if (!confirm(`Are you sure you want to release ${labName}?`)) return;
    try {
      setLoading(true);
      await statusService.checkOutLab(labId);
      await updateStatus();
    } catch (e) {
      alert("Error releasing the lab.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-[2.5rem] border-2 bg-white transition-all duration-500 
      ${isBusy ? 'border-red-500 shadow-2xl shadow-red-50' : 'border-emerald-400 shadow-xl shadow-emerald-50'} 
      hover:shadow-3xl group`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isBusy ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isBusy ? 'text-red-600' : 'text-emerald-600'}`}>
              {isBusy ? 'In Session' : 'Available'}
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter mt-2">{labName}</h3>
        </div>
        
        <button 
          onClick={() => updateStatus()} 
          className="p-3 bg-slate-50 rounded-2xl hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Cuerpo */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <BookOpen size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</p>
            <p className="font-black text-slate-700 text-lg truncate uppercase">{subjectName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Schedule</p>
            <p className="text-sm font-black text-slate-700 text-center">
              {formatEcuadorTime(startTime)} - {formatEcuadorTime(endTime)}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Capacity</p>
            <p className="text-sm font-black text-slate-700 text-center">{capacity} Students</p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      {isBusy ? (
        <div className="bg-gradient-to-br from-red-600 to-rose-700 p-6 rounded-[2rem] text-white shadow-xl shadow-red-200">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest text-center mb-2">Time Remaining</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-6xl font-black tracking-tighter">{time_left_minutes}</p>
            <span className="text-xl font-black italic">MIN</span>
          </div>
          <button 
            onClick={handleCheckOut} 
            disabled={loading}
            className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> End Session Early
          </button>
        </div>
      ) : (
        <button 
          onClick={handleCheckIn} 
          disabled={loading}
          className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={24} />
          ) : (
            <><Play size={20} fill="currentColor"/> Start Class</>
          )}
        </button>
      )}

      {/* Microservice Footer */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-slate-300">
        <ShieldCheck size={14} />
        <span className="text-[9px] font-black uppercase tracking-tighter">Secured State Node</span>
      </div>
    </div>
  );
}; 