import React, { useEffect, useState } from 'react';
import { LabStatusCard } from './LabStatusCard'; 
import { useAuth } from '../../context/AuthContext';
import { Calendar, Search } from 'lucide-react';

// Lógica de conversión Estándar Ecuador (UTC-5)
const utcToEcuadorTime = (utcDate: Date): Date => {
  const ecuadorOffset = -5 * 60; 
  return new Date(utcDate.getTime() + (ecuadorOffset - utcDate.getTimezoneOffset()) * 60000);
};

export const LabGrid = () => {
  const { user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userEmail = user?.email?.toLowerCase().trim() || "";

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // DNS DEL ALB (Backup definitivo)
      const ALB_DNS = "http://qa-alb-1176272014.us-east-1.elb.amazonaws.com/resource";

      // CORRECCIÓN: Ajustamos el nombre para que coincida con Vercel (VITE_API_RESOURCE_URL)
      // Y el fallback ahora apunta a AWS, nunca a localhost.
      const baseUrl = import.meta.env.VITE_API_RESOURCE_URL || ALB_DNS;

      const [labsRes, assignRes] = await Promise.all([
        fetch(`${baseUrl}/laboratories`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${baseUrl}/assignments`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);

      const allLabs = await labsRes.json();
      const allAssignments = await assignRes.json();

      const nowEcuador = utcToEcuadorTime(new Date());
      const currentDayName = nowEcuador.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const todayDateString = nowEcuador.toISOString().split('T')[0];

      const filtered = allAssignments.filter((asig: any) => {
        const isMine = asig.teacherName.toLowerCase().includes(userEmail);
        const asigStartEcu = utcToEcuadorTime(new Date(asig.startTime));
        const asigDateStr = asigStartEcu.toISOString().split('T')[0];

        const isTodayDate = asigDateStr === todayDateString;
        const isTodayRecurring = asig.daysOfWeek?.includes(currentDayName);

        return isMine && (isTodayDate || isTodayRecurring);
      });

      const processed = filtered.map((asig: any) => {
        const lab = allLabs.find((l: any) => l.id === asig.laboratoryId);
        
        const asigStartEcu = utcToEcuadorTime(new Date(asig.startTime));
        const asigDateString = asigStartEcu.toISOString().split('T')[0];

        return {
          id: lab?.id || asig.laboratoryId,
          name: lab?.name || "Laboratorio",
          location: lab?.location || "N/A",
          capacity: lab?.capacity || 25,
          subject: asig.subject,
          startTime: asig.startTime, 
          endTime: asig.endTime,     
          date: asigDateString 
        };
      });

      setMyAssignments(processed);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (userEmail) fetchData(); 
  }, [userEmail]);

  if (loading) return <div className="p-20 text-center font-bold text-indigo-600 animate-pulse uppercase">Sincronizando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-indigo-700 text-sm font-bold">
        <Search size={18} />
        <p>SESIÓN: {userEmail} | HOY: {utcToEcuadorTime(new Date()).toLocaleDateString()}</p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-24 text-center">
          <Calendar className="mx-auto text-slate-200 mb-6" size={80} />
          <h3 className="text-slate-400 font-black text-2xl uppercase">No hay clases hoy</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {myAssignments.map((data, index) => (
            <LabStatusCard 
              key={`${data.id}-${index}`}
              labId={data.id}
              labName={data.name}
              subjectName={data.subject}
              startTime={data.startTime}
              endTime={data.endTime}
              date={data.date}
              capacity={data.capacity}
            />
          ))}
        </div>
      )}
    </div>
  );
};