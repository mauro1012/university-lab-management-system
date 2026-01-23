import React, { useState } from 'react';
import { useLabStatus } from '../../hooks/useLabStatus';
import { statusService } from '../../services/statusService';
import { Clock, Users, BookOpen, RefreshCw, LogOut, Play, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  labId: string; 
  labName: string; 
  subjectName: string;
  capacity: number; 
  startTime: string; 
  endTime: string; 
  date: string;
}

export const LabStatusCard: React.FC<Props> = ({ 
  labId, labName, subjectName, capacity, startTime, endTime, date 
}) => {
  // Hook que conecta con Go/Redis para el estado en tiempo real
  const { status, time_left_minutes, updateStatus } = useLabStatus(labId);
  const [loading, setLoading] = useState(false);

  const isBusy = status === 'BUSY';
  
  // FUNCIÓN MEJORADA: Calcula el tiempo restante automáticamente
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener hora actual y hora de fin de clase
      const now = new Date();
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const targetTime = new Date();
      targetTime.setHours(endHours, endMinutes, 0, 0);

      // 2. Validar si la clase ya terminó antes de empezar
      if (targetTime.getTime() <= now.getTime()) {
        alert("Cannot start: The scheduled end time for this class has already passed.");
        return;
      }

      // 3. Calcular diferencia en minutos
      // (Milisegundos / 1000ms / 60s)
      const diffInMinutes = Math.floor((targetTime.getTime() - now.getTime()) / 60000);
      
      // 4. Asegurar al menos 1 minuto y enviar a Go
      const finalDuration = Math.max(1, diffInMinutes);
      
      await statusService.checkInLab(labId, finalDuration); 
      
      // 5. Refrescar estado inmediatamente
      await updateStatus();
      
    } catch (e) { 
      console.error(e);
      alert("Error connecting to the Status Service (Go). Make sure it is running on port 8081."); 
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
    <div className={`p-6 rounded-[2rem] border-2 bg-white transition-all duration-300 
      ${isBusy ? 'border-red-200 shadow-lg shadow-red-50' : 'border-emerald-100 shadow-lg shadow-emerald-50'} 
      hover:shadow-2xl`}>
      
      {/* Header: Estado y Nombre */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isBusy ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isBusy ? 'text-red-500' : 'text-emerald-500'}`}>
              {isBusy ? 'In Session' : 'Available'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-none mt-2">{labName}</h3>
          <p className="text-[9px] text-gray-400 font-mono mt-1 uppercase">Node ID: {labId}</p>
        </div>
        
        <button 
          onClick={() => updateStatus()} 
          className="p-2 bg-slate-50 rounded-xl hover:rotate-180 transition-transform duration-700"
          title="Refresh status"
        >
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Detalles de la Asignación */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Current Course</p>
            <p className="font-bold text-slate-700 line-clamp-1">{subjectName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Schedule</p>
            <p className="text-sm font-black text-slate-700">{startTime} - {endTime}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Max Capacity</p>
            <p className="text-sm font-black text-slate-700">{capacity} Students</p>
          </div>
        </div>
      </div>

      {/* Acciones: Start Session o Show TTL */}
      {isBusy ? (
        <div className="bg-red-600 p-5 rounded-3xl text-white mb-4 shadow-inner animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Time Remaining (Redis TTL)</p>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-black tracking-tighter">{time_left_minutes}</p>
            <span className="text-sm font-bold uppercase">min</span>
          </div>
          <button 
            onClick={handleCheckOut} 
            disabled={loading}
            className="w-full mt-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> End Session Early
          </button>
        </div>
      ) : (
        <button 
          onClick={handleCheckIn} 
          disabled={loading}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <><Play size={18} fill="currentColor"/> Start Class Session</>
          )}
        </button>
      )}
      
      {/* Footer del Microservicio */}
      <div className="mt-4 flex items-center justify-center gap-1 opacity-20 group hover:opacity-100 transition-opacity">
        <ShieldCheck size={12} />
        <span className="text-[8px] font-bold uppercase tracking-tighter">Verified Redis Session</span>
      </div>
    </div>
  );
};