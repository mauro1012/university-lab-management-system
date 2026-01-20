import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, User, Beaker, X, Trash2, Edit3, Clock, BookOpen } from 'lucide-react';
import resourceApi, { getLaboratories, getAssignments, createAssignment, deleteAssignment } from '../../api/resource.api';
import axios from 'axios';

// Interfaces actualizadas con el campo subject
interface Lab { id: string; name: string; capacity: number; location: string; }
interface Professor { id: string; firstName: string; lastName: string; role: string; email: string; }
interface Assignment { 
  id: string; 
  subject: string; // <-- Agregado
  laboratoryId: string; 
  teacherName: string; 
  startTime: string; 
  endTime: string; 
  isRecurring: boolean; 
  daysOfWeek: string[]; 
}

const AssignmentManagement = () => {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  const userDisplayName = user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || 'Usuario');
  const userEmail = user?.email?.toLowerCase().trim() || "";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    subject: '', // <-- Agregado al estado
    laboratoryId: '', 
    professorId: '', 
    teacherName: '', 
    startTime: '', 
    endTime: '',
    singleDate: '', 
    startMonthYear: '', 
    endMonthYear: '', 
    isRecurring: true, 
    daysOfWeek: [] as string[]
  });

  const daysList = [
    { id: 'MONDAY', label: 'Lun' }, { id: 'TUESDAY', label: 'Mar' },
    { id: 'WEDNESDAY', label: 'Mié' }, { id: 'THURSDAY', label: 'Jue' },
    { id: 'FRIDAY', label: 'Vie' }, { id: 'SATURDAY', label: 'Sáb' }
  ];

  useEffect(() => { loadData(); }, [userEmail, role]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [labsRes, assignRes] = await Promise.all([getLaboratories(), getAssignments()]);
      setLabs(labsRes.data);

      if (role === 'ADMIN') {
        try {
          const usersRes = await axios.get('http://localhost:3000/users', { headers: { Authorization: `Bearer ${token}` } });
          setProfessors(usersRes.data.filter((u: any) => u.role === 'TEACHER' || u.role === 'ADMIN'));
        } catch (e) { console.warn("403 Evitado"); }
      }

      const allAsig = assignRes.data || [];
      const currentName = userDisplayName.trim().toLowerCase();

      setAssignments(role === 'ADMIN' ? allAsig : allAsig.filter((a: any) => {
        if (!a.teacherName) return false;
        const teacherField = a.teacherName.toLowerCase();
        return teacherField.includes(userEmail) || teacherField.includes(currentName);
      }));
    } catch (error) { console.error("Error al cargar datos", error); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      subject: '', // Limpiar materia
      laboratoryId: '', professorId: '', teacherName: '', startTime: '', endTime: '',
      singleDate: '', startMonthYear: '', endMonthYear: '', isRecurring: true, daysOfWeek: []
    });
  };

  const handleEdit = (asig: Assignment) => {
    setEditingId(asig.id);
    const start = new Date(asig.startTime);
    const end = new Date(asig.endTime);
    
    setFormData({
      subject: asig.subject || '', // <-- Cargar materia al editar
      laboratoryId: asig.laboratoryId,
      professorId: '', 
      teacherName: asig.teacherName,
      startTime: start.getUTCHours().toString().padStart(2, '0') + ':' + start.getUTCMinutes().toString().padStart(2, '0'),
      endTime: end.getUTCHours().toString().padStart(2, '0') + ':' + end.getUTCMinutes().toString().padStart(2, '0'),
      singleDate: start.toISOString().split('T')[0],
      startMonthYear: start.toISOString().substring(0, 7),
      endMonthYear: end.toISOString().substring(0, 7),
      isRecurring: asig.isRecurring,
      daysOfWeek: asig.daysOfWeek
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProf = professors.find(p => p.id === formData.professorId);
    
    const identityString = selectedProf 
      ? `${selectedProf.firstName} ${selectedProf.lastName} (${selectedProf.email})` 
      : formData.teacherName;

    try {
      const baseDate = formData.isRecurring ? `${formData.startMonthYear}-01` : formData.singleDate;
      const payload = {
        subject: formData.subject, // <-- Enviar materia en el payload
        laboratoryId: formData.laboratoryId,
        teacherName: identityString,
        startTime: new Date(`${baseDate}T${formData.startTime}:00Z`).toISOString(),
        endTime: new Date(`${baseDate}T${formData.endTime}:00Z`).toISOString(),
        isRecurring: formData.isRecurring,
        daysOfWeek: formData.isRecurring ? formData.daysOfWeek : [],
        endDate: formData.isRecurring ? new Date(`${formData.endMonthYear}-28T23:59:59Z`).toISOString() : null
      };

      if (editingId) {
        await resourceApi.patch(`/assignments/${editingId}`, payload);
      } else {
        await createAssignment(payload);
      }
      
      closeModal();
      loadData();
    } catch (error: any) { alert(error.response?.data?.message || "Error al procesar horario"); }
  };

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Gestión de Horarios</h1>
            <p className="text-gray-400 font-bold italic">Usuario: {userDisplayName}</p>
          </div>
          {role === 'ADMIN' && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl font-black italic uppercase text-xs tracking-widest hover:bg-blue-700 transition-all active:scale-95">
              <Plus size={20} /> Nueva Reserva
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignments.map((asig) => (
            <div key={asig.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Beaker size={24} />
                </div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${asig.isRecurring ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {asig.isRecurring ? 'Semestral' : 'Día Único'}
                </span>
              </div>

              {/* Título: Laboratorio + Materia */}
              <h3 className="font-black text-gray-800 text-2xl uppercase tracking-tighter leading-none">
                {labs.find(l => l.id === asig.laboratoryId)?.name || 'Laboratorio'}
              </h3>
              <p className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1 mb-4 italic flex items-center gap-1">
                <BookOpen size={14} /> {asig.subject || "Sin Materia"}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-gray-500 font-bold italic">
                  <User size={18} className="text-blue-400 mt-1" />
                  <div className="flex flex-col">
                    <span className="leading-tight text-gray-700">{asig.teacherName.split('(')[0]}</span>
                    <span className="text-[11px] text-blue-500">{asig.teacherName.match(/\(([^)]+)\)/)?.[1]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-bold italic">
                  <Clock size={18} className="text-blue-400" />
                  <span>{new Date(asig.startTime).getUTCHours().toString().padStart(2, '0')}:{new Date(asig.startTime).getUTCMinutes().toString().padStart(2, '0')} - {new Date(asig.endTime).getUTCHours().toString().padStart(2, '0')}:{new Date(asig.endTime).getUTCMinutes().toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {asig.daysOfWeek.map((d: string) => (
                  <span key={d} className="text-[10px] bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg font-black text-gray-400 uppercase tracking-tighter group-hover:border-blue-200 group-hover:text-blue-400 transition-colors">
                    {d.substring(0,3)}
                  </span>
                ))}
              </div>

              {role === 'ADMIN' && (
                <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <button onClick={() => handleEdit(asig)} className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm">
                    <Edit3 size={16} /> Editar
                  </button>
                  <button onClick={async () => { if(window.confirm("¿Eliminar reserva?")) { await deleteAssignment(asig.id); loadData(); } }} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm">
                    <Trash2 size={16} /> Borrar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-10 border-b flex justify-between items-center text-gray-900 uppercase italic">
              <h2 className="text-3xl font-black">{editingId ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
              <button onClick={closeModal}><X size={32} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              
              {/* Campo de Materia Agregado */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Asignatura / Materia</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Análisis de Sistemas"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({...formData, isRecurring: true})} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Semestral</button>
                <button type="button" onClick={() => setFormData({...formData, isRecurring: false})} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${!formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Día Único</button>
              </div>
              
              <select required className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" value={formData.laboratoryId} onChange={(e) => setFormData({...formData, laboratoryId: e.target.value})}>
                <option value="">Seleccionar Laboratorio...</option>
                {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>

              <select required className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" value={formData.professorId} onChange={(e) => setFormData({...formData, professorId: e.target.value})}>
                <option value="">Seleccionar Docente...</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input type="time" required value={formData.startTime} className="px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                <input type="time" required value={formData.endTime} className="px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>

              {formData.isRecurring ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="month" required value={formData.startMonthYear} className="px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" onChange={(e) => setFormData({...formData, startMonthYear: e.target.value})} />
                    <input type="month" required value={formData.endMonthYear} className="px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" onChange={(e) => setFormData({...formData, endMonthYear: e.target.value})} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {daysList.map(d => (
                      <button key={d.id} type="button" onClick={() => setFormData(p => ({...p, daysOfWeek: p.daysOfWeek.includes(d.id) ? p.daysOfWeek.filter(x => x!==d.id) : [...p.daysOfWeek, d.id]}))} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${formData.daysOfWeek.includes(d.id) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>{d.label}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <input type="date" required value={formData.singleDate} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold border-none" onChange={(e) => setFormData({...formData, singleDate: e.target.value})} />
              )}
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] text-xl uppercase italic shadow-2xl hover:bg-blue-700 active:scale-95 transition-all">
                {editingId ? 'Actualizar Cambios' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;