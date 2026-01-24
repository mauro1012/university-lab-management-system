import React, { useEffect, useState, useMemo } from 'react';
import { publicService } from '../../services/publicService';
import { Search, Filter, Clock, Calendar, AlertCircle, RefreshCw, MapPin } from 'lucide-react';

// --- FUNCIONES DE CONVERSIÓN (LA MISMA LÓGICA DE ASSIGNMENT) ---
const utcToEcuadorTime = (utcDate: Date): Date => {
  const ecuadorOffset = -5 * 60; // -5 horas en minutos
  return new Date(utcDate.getTime() + (ecuadorOffset - utcDate.getTimezoneOffset()) * 60000);
};

// --- INTERFACES ---
interface LabData {
  id: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  laboratoryId: string;
  daysOfWeek: string[];
  isLive: boolean;
  minutesLeft: number;
  laboratory: { name: string; location: string; };
}

export const PublicView: React.FC = () => {
  const [labs, setLabs] = useState<LabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "LIVE" | "AVAILABLE">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // --- FORMATEADOR DE HORA MEJORADO ---
  const formatTimeFromISO = (isoString: string): string => {
    if (!isoString) return '--:--';
    try {
      const dateUTC = new Date(isoString);
      const dateEcuador = utcToEcuadorTime(dateUTC);
      
      return dateEcuador.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Formato 24h
        timeZone: 'America/Guayaquil'
      });
    } catch (e) {
      return '--:--';
    }
  };

  const loadData = async () => {
    try {
      const [assignments, statuses] = await Promise.all([
        publicService.getAssignments(),
        publicService.getAllStatuses()
      ]);

      // Detectar hoy en Ecuador para el filtrado
      const nowEcu = utcToEcuadorTime(new Date());
      const today = nowEcu.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      const merged = assignments
        .filter((asig: any) => asig.daysOfWeek.includes(today) || asig.daysOfWeek.length === 0)
        .map((asig: any): LabData => {
          const liveStatus = statuses.find((s: any) => s.id === asig.laboratoryId);
          return {
            ...asig,
            minutesLeft: liveStatus ? liveStatus.minutes : 0,
            isLive: !!liveStatus,
          };
        });

      setLabs(merged);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Error de conexión con los microservicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      const matchesSearch = 
        lab.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.laboratory.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        filterStatus === "ALL" || 
        (filterStatus === "LIVE" && lab.isLive) || 
        (filterStatus === "AVAILABLE" && !lab.isLive);
      return matchesSearch && matchesStatus;
    });
  }, [labs, searchTerm, filterStatus]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">CARTELERA UNIVERSITARIA</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-bold text-sm">
            <span className="flex items-center gap-2"><Calendar size={16}/> {utcToEcuadorTime(new Date()).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span className="flex items-center gap-2"><Clock size={16}/> Sincronizado: {lastUpdated?.toLocaleTimeString()}</span>
          </div>
        </header>

        {/* Buscador y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por profesor, materia o lab..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            {(["ALL", "LIVE", "AVAILABLE"] as const).map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                {s === 'ALL' ? 'TODOS' : s === 'LIVE' ? 'EN CLASE' : 'LIBRES'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Laboratorios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLabs.map(lab => (
            <div key={lab.id} className={`bg-white rounded-[2rem] border-4 transition-all duration-500 ${lab.isLive ? 'border-green-500 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-md'}`}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${lab.isLive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 leading-none">{lab.laboratory.name}</h2>
                      <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">{lab.laboratory.location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-6">
                  <h3 className="text-indigo-600 font-black text-xl leading-tight mb-2 uppercase">{lab.subject}</h3>
                  <p className="text-slate-500 font-bold text-sm">👨‍🏫 {lab.teacherName.split('(')[0]}</p>
                  
                  <div className="flex justify-between items-center mt-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Horario</span>
                    <span className="text-slate-800 font-black text-sm">
                      {formatTimeFromISO(lab.startTime)} - {formatTimeFromISO(lab.endTime)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {lab.isLive ? (
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-green-600 mb-2">
                        <span>● SESIÓN ACTIVA</span>
                        <span>{lab.minutesLeft} MIN RESTANTES</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                          style={{ width: `${Math.min(100, (lab.minutesLeft / 120) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 text-center bg-slate-50 rounded-2xl">
                      <p className="text-slate-300 font-black text-xs">AULA DISPONIBLE / SIN CLASE</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};