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
      const baseUrl = import.meta.env.VITE_RESOURCES_API_URL || "http://localhost:3001";

      const [labsRes, assignRes] = await Promise.all([
        fetch(`${baseUrl}/resource/laboratories`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${baseUrl}/resource/assignments`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);

      const allLabs: Lab[] = await labsRes.json();
      const allAssignments: Assignment[] = await assignRes.json();

      // --- LOCAL TIME LOGIC ---
      const now = new Date();
      const currentDayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri
      const todayStr = now.toISOString().split('T')[0];

      // --- FLEXIBLE FILTERING ---
      const filtered = allAssignments.filter(asig => {
        // 1. User Match (Email contained in teacherName)
        const isMine = asig.teacherName.toLowerCase().includes(userEmail);
        
        // 2. Date Match (Specific day match)
        const isToday = asig.startTime.startsWith(todayStr);

        // 3. Semester Match (Day of the week match)
        // Remove 'Z' to prevent Date() from shifting time to UTC
        const asigDate = new Date(asig.startTime.replace('Z', ''));
        const isSameDayOfWeek = asigDate.getDay() === currentDayOfWeek;

        return isMine && (isToday || isSameDayOfWeek);
      });

      // --- DATA MAPPING ---
      const processed = filtered.map(asig => {
        const lab = allLabs.find(l => l.id === asig.laboratoryId);
        
        // Clean HH:mm extraction
        const getH = (s: string) => s.includes('T') ? s.split('T')[1].substring(0, 5) : s.substring(0, 5);
        
        const startTimeStr = getH(asig.startTime);
        let endTimeStr = asig.endTime ? getH(asig.endTime) : "";
        
        if (!endTimeStr) {
          const [h, m] = startTimeStr.split(':').map(Number);
          endTimeStr = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        return {
          id: lab?.id || asig.laboratoryId,
          name: lab?.name || "Unknown Lab",
          location: lab?.location || "N/A",
          capacity: lab?.capacity || 25,
          subject: asig.subject,
          startTime: startTimeStr,
          endTime: endTimeStr,
          date: todayStr 
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