import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, User, Beaker, X, Trash2, Repeat, Edit3 } from 'lucide-react';
import resourceApi, { getLaboratories, getAssignments, createAssignment, deleteAssignment } from '../../api/resource.api';
import axios from 'axios';

interface Lab { id: string; name: string; capacity: number; location: string; }
interface Professor { id: string; firstName: string; lastName: string; role: string; }
interface Assignment { 
  id: string; 
  laboratoryId: string; 
  teacherName: string; 
  startTime: string; 
  endTime: string; 
  isRecurring: boolean; 
  daysOfWeek: string[];
}

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [labsRes, usersRes, assignRes] = await Promise.all([
        getLaboratories(),
        axios.get('http://localhost:3000/users', { headers: { Authorization: `Bearer ${token}` } }),
        getAssignments()
      ]);
      setLabs(labsRes.data);
      setProfessors(usersRes.data.filter((u: any) => u.role === 'TEACHER' || u.role === 'ADMIN'));
      setAssignments(assignRes.data);
    } catch (error) { console.error("Error al cargar datos", error); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      laboratoryId: '', professorId: '', teacherName: '', startTime: '', endTime: '',
      singleDate: '', startMonthYear: '', endMonthYear: '', isRecurring: true, daysOfWeek: []
    });
  };

  const handleEdit = (asig: Assignment) => {
    setEditingId(asig.id);
    const start = new Date(asig.startTime);
    const end = new Date(asig.endTime);
    
    // Formatear fechas para los inputs HTML
    const dateStr = start.toISOString().split('T')[0];
    const monthStr = start.toISOString().substring(0, 7);

    setFormData({
      laboratoryId: asig.laboratoryId,
      professorId: '', 
      teacherName: asig.teacherName,
      startTime: start.toTimeString().substring(0, 5),
      endTime: end.toTimeString().substring(0, 5),
      singleDate: dateStr,
      startMonthYear: monthStr,
      endMonthYear: end.toISOString().substring(0, 7),
      isRecurring: asig.isRecurring,
      daysOfWeek: asig.daysOfWeek
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta asignación?")) {
      try {
        await deleteAssignment(id);
        loadData();
      } catch (error) { alert("Error al eliminar"); }
    }
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayId) 
        ? prev.daysOfWeek.filter(d => d !== dayId) 
        : [...prev.daysOfWeek, dayId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseDate = formData.isRecurring ? `${formData.startMonthYear}-01` : formData.singleDate;
      const payload = {
        laboratoryId: formData.laboratoryId,
        teacherName: formData.teacherName,
        startTime: new Date(`${baseDate}T${formData.startTime}:00`).toISOString(),
        endTime: new Date(`${baseDate}T${formData.endTime}:00`).toISOString(),
        isRecurring: formData.isRecurring,
        daysOfWeek: formData.isRecurring ? formData.daysOfWeek : [],
        endDate: formData.isRecurring ? new Date(`${formData.endMonthYear}-28T23:59:59`).toISOString() : null
      };

      if (editingId) {
        // USAMOS resourceApi para incluir el token automáticamente
        await resourceApi.patch(`/assignments/${editingId}`, payload);
        alert("Asignación actualizada con éxito");
      } else {
        await createAssignment(payload);
        alert("Asignación registrada con éxito");
      }
      
      closeModal();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Conflicto de horario detectado");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Asignación de Laboratorio</h1>
            <p className="text-gray-500 text-lg mt-1 font-medium italic">Gestión de horarios semestrales y eventos únicos.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl font-bold">
            <Plus size={24} strokeWidth={3} /> Nueva Asignación
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((asig) => (
            <div key={asig.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Beaker size={24} />
                </div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${asig.isRecurring ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {asig.isRecurring ? 'Semestral' : 'Día Único'}
                </span>
              </div>
              <h3 className="font-black text-gray-800 text-2xl mb-2">{labs.find(l => l.id === asig.laboratoryId)?.name || 'Laboratorio'}</h3>
              <p className="text-gray-500 font-bold mb-1 flex items-center gap-3"><User size={18} /> {asig.teacherName}</p>
              
              <div className="flex flex-wrap gap-1 mt-3 mb-6">
                {asig.daysOfWeek.map(d => <span key={d} className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-600 uppercase">{d.substring(0,3)}</span>)}
              </div>

              <div className="mt-auto flex gap-2 border-t pt-5">
                <button onClick={() => handleEdit(asig)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">
                  <Edit3 size={16} /> Editar
                </button>
                <button onClick={() => handleDelete(asig.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-10 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-black text-gray-900">{editingId ? 'Editar Asignación' : 'Configurar Asignación'}</h2>
              <button onClick={closeModal}><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({...formData, isRecurring: true})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Semestral</button>
                <button type="button" onClick={() => setFormData({...formData, isRecurring: false})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${!formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Día Único</button>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Profesor Responsable</label>
                <select required value={formData.professorId} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold text-lg outline-none" onChange={(e) => {
                  const p = professors.find(p => p.id === e.target.value);
                  setFormData({...formData, professorId: e.target.value, teacherName: p ? `${p.firstName} ${p.lastName}` : ''});
                }}>
                  <option value="">Seleccionar...</option>
                  {professors.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Laboratorio</label>
                <select required value={formData.laboratoryId} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold text-lg outline-none" onChange={(e) => setFormData({...formData, laboratoryId: e.target.value})}>
                  <option value="">Seleccionar Aula...</option>
                  {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Días de Reserva</label>
                  <div className="flex flex-wrap gap-2">
                    {daysList.map(day => (
                      <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${formData.daysOfWeek.includes(day.id) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {formData.isRecurring ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Mes Inicio</label>
                      <input type="month" required value={formData.startMonthYear} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold" onChange={(e) => setFormData({...formData, startMonthYear: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Mes Fin</label>
                      <input type="month" required value={formData.endMonthYear} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold" onChange={(e) => setFormData({...formData, endMonthYear: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Fecha de Reserva</label>
                    <input type="date" required value={formData.singleDate} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold" onChange={(e) => setFormData({...formData, singleDate: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Entrada</label>
                  <input type="time" required value={formData.startTime} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold" onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Salida</label>
                  <input type="time" required value={formData.endTime} className="w-full px-6 py-4 rounded-2xl bg-gray-50 font-bold" onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-700 shadow-2xl text-xl mt-4 transition-all">
                {editingId ? 'Actualizar Asignación' : 'Finalizar Asignación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;