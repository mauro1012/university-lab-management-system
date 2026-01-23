import React, { useState } from 'react';
import { useLabStatus } from '../../hooks/useLabStatus';
import { statusService } from '../../services/statusService';
import { Clock, Users, BookOpen, RefreshCw, LogOut, Play, ShieldCheck } from 'lucide-react';

interface Props {
  labId: string; labName: string; subjectName: string;
  capacity: number; startTime: string; endTime: string; date: string;
}

export const LabStatusCard: React.FC<Props> = ({ 
  labId, labName, subjectName, capacity, startTime, endTime, date 
}) => {
  const { status, time_left_minutes, updateStatus } = useLabStatus(labId);
  const [loading, setLoading] = useState(false);

  const isBusy = status === 'BUSY';
  
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const [h, m] = endTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);

      const diff = Math.max(1, Math.floor((target.getTime() - now.getTime()) / 60000));
      
      await statusService.checkInLab(labId, diff); 
      await updateStatus();
    } catch (e) { 
      alert("Error starting session"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to release this lab?")) return;
    setLoading(true);
    await statusService.checkOutLab?.(labId);
    await updateStatus();
    setLoading(false);
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 bg-white transition-all duration-300 ${isBusy ? 'border-red-200 shadow-lg shadow-red-50' : 'border-emerald-100 shadow-lg shadow-emerald-50'} hover:shadow-2xl`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isBusy ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isBusy ? 'text-red-500' : 'text-emerald-500'}`}>
              {isBusy ? 'In Session' : 'Available'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-none mt-2">{labName}</h3>
          <p className="text-[9px] text-gray-400 font-mono mt-1 uppercase">Node ID: {labId}</p>
        </div>
        <button onClick={() => updateStatus()} className="p-2 bg-slate-50 rounded-xl hover:rotate-180 transition-transform duration-700">
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Current Course</p>
            <p className="font-bold text-slate-700">{subjectName}</p>
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

      {isBusy ? (
        <div className="bg-red-600 p-5 rounded-3xl text-white mb-4 shadow-inner">
          <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Redis TTL Remaining</p>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-black tracking-tighter">{time_left_minutes}</p>
            <span className="text-sm font-bold uppercase">min</span>
          </div>
          <button 
            onClick={handleCheckOut} 
            className="w-full mt-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 transition-all"
          >
            End Session Early
          </button>
        </div>
      ) : (
        <button 
          onClick={handleCheckIn} 
          disabled={loading}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? "Processing..." : <><Play size={18} fill="currentColor"/> Start Class Session</>}
        </button>
      )}
      
      <div className="mt-4 flex items-center justify-center gap-1 opacity-20 group hover:opacity-100 transition-opacity">
        <ShieldCheck size={12} />
        <span className="text-[8px] font-bold uppercase tracking-tighter">Verified Microservice Session</span>
      </div>
    </div>
  );
};