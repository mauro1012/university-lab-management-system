import React, { useEffect, useState } from 'react';
import { LabStatusCard } from './LabStatusCard';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, Search, AlertTriangle } from 'lucide-react';

interface Assignment {
  laboratoryId: string;
  teacherName: string;
  startTime: string; 
  endTime?: string;   
  subject: string;
}

interface Lab {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export const LabGrid = () => {
  const { user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userEmail = user?.email?.toLowerCase().trim() || "";

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_RESOURCE_API_URL || "http://qa-alb-1176272014.us-east-1.elb.amazonaws.com/resource";

      const [labsRes, assignRes] = await Promise.all([
        fetch(`${baseUrl}/laboratories`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${baseUrl}/assignments`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);

      const allLabs: Lab[] = await labsRes.json();
      const allAssignments: Assignment[] = await assignRes.json();

      // --- LOGICA DE TIEMPO LOCAL (SIN DESFASES) ---
      const now = new Date();
      const currentDayOfWeek = now.getDay(); 
      
      // Creamos un "Hoy" a medianoche exacta para comparar fechas sin horas
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // --- FILTRADO FLEXIBLE Y ROBUSTO ---
      const filtered = allAssignments.filter(asig => {
        const isMine = asig.teacherName.toLowerCase().includes(userEmail);
  
        // 1. Limpiamos la fecha de la asignación de cualquier ajuste de zona horaria
        // Al quitar la 'Z', evitamos que el navegador sume o reste horas
        const asigDate = new Date(asig.startTime.replace('Z', ''));
        
        // 2. Comparamos el día de la semana (para semestrales)
        const isSameDayOfWeek = asigDate.getDay() === currentDayOfWeek;
        
        // 3. Comparamos la fecha exacta a medianoche (para clases de un solo día)
        const asigStartDay = new Date(asigDate.getFullYear(), asigDate.getMonth(), asigDate.getDate());
        const isTodayExact = asigStartDay.getTime() === todayStart.getTime();

        return isMine && (isTodayExact || isSameDayOfWeek);
      });

      // --- PROCESAMIENTO DE DATOS (EXTRACCIÓN DE HORA PURA) ---
      const processed = filtered.map(asig => {
        const lab = allLabs.find(l => l.id === asig.laboratoryId);
        
        // Función que corta el texto directamente para evitar el salto de 15 horas
        const getExactH = (s: string) => {
          if (!s) return "00:00";

        // Intentamos buscar el patrón HH:mm dentro del string
        // Esto funciona aunque el string sea "2026-01-23 06:17:00" o "2026-01-23T06:17:00Z"
        const match = s.match(/(\d{2}:\d{2})/);
  
              if (match) {
          return match[0]; // Retorna directamente "06:17"
            }

        // Si no encuentra el patrón, hacemos el recorte manual por posición
        if (s.includes('T')) {
          return s.split('T')[1].substring(0, 5);
            }
  
        return s.substring(0, 5);
            };
        
        const startTimeStr = getExactH(asig.startTime);
        let endTimeStr = asig.endTime ? getExactH(asig.endTime) : "";
        
        // Si no hay hora de fin, calculamos +1 hora
        if (!endTimeStr || endTimeStr === "00:00") {
          const [h, m] = startTimeStr.split(':').map(Number);
          endTimeStr = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        return {
          id: lab?.id || asig.laboratoryId,
          name: lab?.name || "Unknown Lab",
          location: lab?.location || "N/A",
          capacity: lab?.capacity || 25,
          subject: asig.subject,
          startTime: startTimeStr, // Mostrará 06:17 exacto
          endTime: endTimeStr,   // Mostrará 08:17 exacto
          date: asig.startTime.split('T')[0] 
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

  if (loading) return (
    <div className="p-20 text-center font-bold text-blue-600 animate-pulse">
      Syncing Laboratory Data...
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Debugging Header */}
      <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-700 text-sm">
        <Search size={18} />
        <p>Searching for: <strong>{userEmail}</strong> | Local Date: <strong>{new Date().toLocaleDateString()}</strong></p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] py-20 text-center">
          <Calendar className="mx-auto text-gray-200 mb-4" size={64} />
          <h3 className="text-gray-400 font-black text-xl uppercase">No Classes Found Today</h3>
          <p className="text-gray-300 text-sm mt-2">Check if your email is correctly assigned in the database.</p>
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