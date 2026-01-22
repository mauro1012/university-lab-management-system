import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, User, Beaker, X, Trash2, Edit3, Clock, BookOpen, Filter, Search, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import resourceApi, { getLaboratories, getAssignments, createAssignment, deleteAssignment } from '../../api/resource.api';
import { getUsers } from '../../api/auth.api';

// Updated interfaces with subject field
interface Lab { id: string; name: string; capacity: number; location: string; }
interface Professor { id: string; firstName: string; lastName: string; role: string; email: string; }
interface Assignment { 
  id: string; 
  subject: string;
  laboratoryId: string; 
  teacherName: string; 
  startTime: string; 
  endTime: string; 
  isRecurring: boolean; 
  daysOfWeek: string[];
  endDate?: string;
}

const AssignmentManagement = () => {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  const userDisplayName = user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || 'User');
  const userEmail = user?.email?.toLowerCase().trim() || "";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [conflictCheck, setConflictCheck] = useState<{hasConflict: boolean, conflicts: Assignment[]}>({hasConflict: false, conflicts: []});
  
  const [formData, setFormData] = useState({
    subject: '',
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
    { id: 'MONDAY', label: 'Mon' }, { id: 'TUESDAY', label: 'Tue' },
    { id: 'WEDNESDAY', label: 'Wed' }, { id: 'THURSDAY', label: 'Thu' },
    { id: 'FRIDAY', label: 'Fri' }, { id: 'SATURDAY', label: 'Sat' }
  ];

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => { 
    loadData(); 
  }, [userEmail, role]);

  // Filter assignments based on search and filters
  useEffect(() => {
    let result = assignments;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(assignment => 
        assignment.subject.toLowerCase().includes(searchLower) ||
        assignment.teacherName.toLowerCase().includes(searchLower) ||
        labs.find(l => l.id === assignment.laboratoryId)?.name.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterLab !== 'all') {
      result = result.filter(assignment => assignment.laboratoryId === filterLab);
    }
    
    if (filterType !== 'all') {
      result = result.filter(assignment => 
        filterType === 'recurring' ? assignment.isRecurring : !assignment.isRecurring
      );
    }
    
    setFilteredAssignments(result);
  }, [searchTerm, filterLab, filterType, assignments, labs]);

  // Check for conflicts when form data changes
  useEffect(() => {
    if (formData.laboratoryId && formData.startTime && formData.endTime && 
        (formData.isRecurring ? (formData.startMonthYear && formData.endMonthYear && formData.daysOfWeek.length > 0) : formData.singleDate)) {
      checkForConflicts();
    } else {
      setConflictCheck({hasConflict: false, conflicts: []});
    }
  }, [formData, assignments]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [labsRes, assignRes] = await Promise.all([getLaboratories(), getAssignments()]);
      setLabs(labsRes.data);
      setAssignments(assignRes.data);

      if (role === 'ADMIN') {
        try {
          const response = await getUsers(); 
          const filteredProfessors = response.data.filter(
            (u: any) => u.role === 'TEACHER' || u.role === 'ADMIN'
          );
          setProfessors(filteredProfessors);
        } catch (e) { 
          console.error("Access prevented or path error", e);
        }
      }

      const allAsig = assignRes.data || [];
      const currentName = userDisplayName.trim().toLowerCase();

      const userAssignments = role === 'ADMIN' 
        ? allAsig 
        : allAsig.filter((a: any) => {
            if (!a.teacherName) return false;
            const teacherField = a.teacherName.toLowerCase();
            return teacherField.includes(userEmail) || teacherField.includes(currentName);
          });

      setAssignments(userAssignments);
      setFilteredAssignments(userAssignments);
    } catch (error) { 
      console.error("Error loading data", error);
      showNotification('error', 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      subject: '',
      laboratoryId: '', 
      professorId: '', 
      teacherName: '', 
      startTime: '', 
      endTime: '',
      singleDate: '', 
      startMonthYear: '', 
      endMonthYear: '', 
      isRecurring: true, 
      daysOfWeek: []
    });
    setConflictCheck({hasConflict: false, conflicts: []});
  };

  // Función para convertir UTC a hora de Ecuador
  const utcToEcuadorTime = (utcDate: Date): Date => {
    // Ecuador está en UTC-5
    const ecuadorOffset = -5 * 60; // -5 horas en minutos
    const ecuadorTime = new Date(utcDate.getTime() + (ecuadorOffset - utcDate.getTimezoneOffset()) * 60000);
    return ecuadorTime;
  };

  // Función para convertir hora de Ecuador a UTC
  const ecuadorToUTCTime = (ecuadorDate: Date): Date => {
    // Ecuador está en UTC-5
    const ecuadorOffset = -5 * 60; // -5 horas en minutos
    const utcTime = new Date(ecuadorDate.getTime() - (ecuadorOffset - ecuadorDate.getTimezoneOffset()) * 60000);
    return utcTime;
  };

  const handleEdit = (asig: Assignment) => {
    setEditingId(asig.id);
    
    // Convertir UTC a hora de Ecuador para mostrar
    const startUTC = new Date(asig.startTime);
    const endUTC = new Date(asig.endTime);
    
    const startEcuador = utcToEcuadorTime(startUTC);
    const endEcuador = utcToEcuadorTime(endUTC);
    
    // Formatear hora para Ecuador (formato 24h)
    const formatEcuadorTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Guayaquil'
      });
    };

    const startTimeLocal = formatEcuadorTime(startEcuador);
    const endTimeLocal = formatEcuadorTime(endEcuador);
    
    setFormData({
      subject: asig.subject || '',
      laboratoryId: asig.laboratoryId,
      professorId: '', 
      teacherName: asig.teacherName,
      startTime: startTimeLocal,
      endTime: endTimeLocal,
      singleDate: startEcuador.toISOString().split('T')[0],
      startMonthYear: startEcuador.toISOString().substring(0, 7),
      endMonthYear: endEcuador.toISOString().substring(0, 7),
      isRecurring: asig.isRecurring,
      daysOfWeek: asig.daysOfWeek
    });
    setIsModalOpen(true);
  };

  
  // Función para verificar conflictos de horario optimizada
  const checkForConflicts = () => {
    if (!formData.laboratoryId || !formData.startTime || !formData.endTime) {
      setConflictCheck({hasConflict: false, conflicts: []});
      return;
    }

    try {
      // 1. Preparar datos de la nueva reserva en minutos totales (Ecuador Time)
      const [newStartH, newStartM] = formData.startTime.split(':').map(Number);
      const [newEndH, newEndM] = formData.endTime.split(':').map(Number);
      const newStartTotalMins = newStartH * 60 + newStartM;
      const newEndTotalMins = newEndH * 60 + newEndM;

      const conflicts: Assignment[] = [];

      assignments.forEach((assignment) => {
        // Excluir la reserva que estamos editando
        if (editingId && assignment.id === editingId) return;
        
        // Regla de Oro: Solo hay conflicto si es el mismo Laboratorio
        if (assignment.laboratoryId !== formData.laboratoryId) return;

        // 2. Preparar datos de la reserva existente (Convertir UTC a Ecuador para comparar peras con peras)
        const existingStartUTC = new Date(assignment.startTime);
        const existingEndUTC = new Date(assignment.endTime);
        const existingStartEcu = utcToEcuadorTime(existingStartUTC);
        const existingEndEcu = utcToEcuadorTime(existingEndUTC);

        const existingStartTotalMins = existingStartEcu.getHours() * 60 + existingStartEcu.getMinutes();
        const existingEndTotalMins = existingEndEcu.getHours() * 60 + existingEndEcu.getMinutes();

        // 3. Verificar superposición de Horas (Time Overlap)
        // (StartA < EndB) && (EndA > StartB)
        const timeOverlap = newStartTotalMins < existingEndTotalMins && newEndTotalMins > existingStartTotalMins;

        if (timeOverlap) {
          // 4. Si hay choque de horas, verificar choque de días/fechas según el tipo
          
          // CASO A: Ambas son recurrentes (Semestrales)
          if (formData.isRecurring && assignment.isRecurring) {
            const commonDays = assignment.daysOfWeek.filter(day => formData.daysOfWeek.includes(day));
            if (commonDays.length > 0) conflicts.push(assignment);
          } 
          
          // CASO B: Ambas son día único
          else if (!formData.isRecurring && !assignment.isRecurring) {
            if (formData.singleDate === existingStartEcu.toISOString().split('T')[0]) {
              conflicts.push(assignment);
            }
          } 
          
          // CASO C: Una recurrente y otra día único (Validación Cruzada)
          else {
            const recurring = formData.isRecurring ? formData : { ...assignment, singleDate: existingStartEcu.toISOString().split('T')[0] };
            const single = formData.isRecurring ? { ...assignment, singleDate: existingStartEcu.toISOString().split('T')[0] } : formData;
            
            // Obtener el nombre del día de la semana de la reserva de día único (ej: "MONDAY")
            const dateObj = new Date(single.singleDate + 'T12:00:00'); // T12 para evitar errores de zona horaria
            const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const singleDayName = dayNames[dateObj.getDay()];

            // Hay conflicto si el día de la reserva única está en la lista de días de la recurrente
            if (recurring.daysOfWeek.includes(singleDayName)) {
              conflicts.push(assignment);
            }
          }
        }
      });

      setConflictCheck({
        hasConflict: conflicts.length > 0,
        conflicts
      });
    } catch (error) {
      console.error("Error checking conflicts:", error);
      setConflictCheck({hasConflict: false, conflicts: []});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.subject.trim()) {
      showNotification('error', 'Please enter a subject/course');
      return;
    }

    if (!formData.laboratoryId) {
      showNotification('error', 'Please select a laboratory');
      return;
    }

    if (!formData.professorId) {
      showNotification('error', 'Please select a teacher');
      return;
    }

    const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
    const endTime = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (endTime <= startTime) {
      showNotification('error', 'End time must be after start time');
      return;
    }

    // Validar duración mínima (al menos 30 minutos)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes < 30) {
      showNotification('error', 'Minimum reservation duration is 30 minutes');
      return;
    }

    if (formData.isRecurring) {
      if (!formData.startMonthYear || !formData.endMonthYear) {
        showNotification('error', 'Please select start and end months');
        return;
      }
      
      const startMonth = new Date(`${formData.startMonthYear}-01`);
      const endMonth = new Date(`${formData.endMonthYear}-01`);
      
      if (endMonth <= startMonth) {
        showNotification('error', 'End month must be after start month');
        return;
      }

      if (formData.daysOfWeek.length === 0) {
        showNotification('error', 'Please select at least one day of the week');
        return;
      }
    } else {
      if (!formData.singleDate) {
        showNotification('error', 'Please select a date');
        return;
      }

      const selectedDate = new Date(formData.singleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        showNotification('error', 'Cannot create reservations for past dates');
        return;
      }
    }

    // Verificar conflictos antes de enviar
    if (conflictCheck.hasConflict) {
      showNotification('error', 'There are schedule conflicts. Please resolve them before submitting.');
      return;
    }

    const selectedProf = professors.find(p => p.id === formData.professorId);
    
    const identityString = selectedProf 
      ? `${selectedProf.firstName} ${selectedProf.lastName} (${selectedProf.email})` 
      : formData.teacherName;

    try {
      // Crear fechas en hora de Ecuador
      let startDateTime: Date;
      let endDateTime: Date;
      
      if (formData.isRecurring) {
        // Para horarios recurrentes, usar el primer día del mes
        startDateTime = new Date(`${formData.startMonthYear}-01T${formData.startTime}:00`);
        endDateTime = new Date(`${formData.startMonthYear}-01T${formData.endTime}:00`);
      } else {
        // Para días únicos, usar la fecha específica
        startDateTime = new Date(`${formData.singleDate}T${formData.startTime}:00`);
        endDateTime = new Date(`${formData.singleDate}T${formData.endTime}:00`);
      }
      
      // Convertir a UTC para enviar al backend
      const startUTC = ecuadorToUTCTime(startDateTime);
      const endUTC = ecuadorToUTCTime(endDateTime);
      
      const payload = {
        subject: formData.subject,
        laboratoryId: formData.laboratoryId,
        teacherName: identityString,
        startTime: startUTC.toISOString(), // Enviar en UTC
        endTime: endUTC.toISOString(),     // Enviar en UTC
        isRecurring: formData.isRecurring,
        daysOfWeek: formData.isRecurring ? formData.daysOfWeek : [],
        endDate: formData.isRecurring ? ecuadorToUTCTime(new Date(`${formData.endMonthYear}-28T${formData.endTime}:00`)).toISOString() : null
      };

      if (editingId) {
        await resourceApi.patch(`/assignments/${editingId}`, payload);
        showNotification('success', 'Schedule updated successfully');
      } else {
        await createAssignment(payload);
        showNotification('success', 'Schedule created successfully');
      }
      
      closeModal();
      loadData();
    } catch (error: any) { 
      console.error('Error:', error);
      showNotification('error', error.response?.data?.message || "Error processing schedule");
    }
  };

  const handleDelete = async (id: string, labName: string) => {
    if (window.confirm(`Are you sure you want to delete schedule for "${labName}"?`)) {
      try {
        await deleteAssignment(id);
        showNotification('success', 'Schedule deleted successfully');
        loadData();
      } catch (error) {
        showNotification('error', 'Error deleting schedule');
      }
    }
  };

  // Función para formatear hora local de Ecuador
  const formatEcuadorTime = (dateString: string) => {
    const date = new Date(dateString);
    // Asumir que la fecha viene en UTC del backend
    const ecuadorDate = utcToEcuadorTime(date);
    
    return ecuadorDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Guayaquil'
    });
  };

  // Función para formatear fecha local de Ecuador
  const formatEcuadorDate = (dateString: string) => {
    const date = new Date(dateString);
    // Asumir que la fecha viene en UTC del backend
    const ecuadorDate = utcToEcuadorTime(date);
    
    return ecuadorDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Guayaquil'
    });
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const recurringAssignments = assignments.filter(a => a.isRecurring).length;
  const singleAssignments = assignments.filter(a => !a.isRecurring).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right">
          <div className={`bg-gradient-to-r ${notification.type === 'success' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg">
                  <Calendar className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">Schedule Management</h1>
                  <p className="text-gray-600 text-lg mt-1">Manage laboratory assignments and schedules</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <User size={16} />
                    <span>Logged in as: <span className="font-semibold text-blue-600">{userDisplayName}</span></span>
                  </div>
                </div>
              </div>
              
              {role === 'ADMIN' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl shadow-xl font-bold hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <Plus size={20} />
                  <span>New Schedule</span>
                  <Plus size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Schedules</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{totalAssignments}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <Calendar className="text-blue-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Semester Schedules</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{recurringAssignments}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <Beaker className="text-purple-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Single Day</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{singleAssignments}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <Clock className="text-amber-600" size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by subject, teacher, or laboratory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={filterLab}
                    onChange={(e) => setFilterLab(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="all">All Laboratories</option>
                    {labs.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="recurring">Semester Schedules</option>
                    <option value="single">Single Day</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
              <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No schedules found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || filterLab !== 'all' || filterType !== 'all' 
                  ? 'No schedules match your search criteria'
                  : 'No schedules available. Create your first schedule.'
                }
              </p>
              {role === 'ADMIN' && !searchTerm && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Create Schedule
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((asig) => {
                const lab = labs.find(l => l.id === asig.laboratoryId);
                const startUTC = new Date(asig.startTime);
                const endUTC = new Date(asig.endTime);
                
                // Convertir a hora de Ecuador
                const startEcuador = utcToEcuadorTime(startUTC);
                const endEcuador = utcToEcuadorTime(endUTC);
                
                return (
                  <div key={asig.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-3 rounded-xl ${asig.isRecurring ? 'bg-purple-50' : 'bg-amber-50'}`}>
                        <Beaker className={asig.isRecurring ? 'text-purple-600' : 'text-amber-600'} size={24} />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${asig.isRecurring ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {asig.isRecurring ? 'Semester' : 'Single Day'}
                      </span>
                    </div>

                    {/* Laboratory and Subject */}
                    <h3 className="font-bold text-gray-900 text-xl mb-1">
                      {lab?.name || 'Laboratory'}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
                      <BookOpen size={14} />
                      <span>{asig.subject || "No subject assigned"}</span>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <User size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">{asig.teacherName.split('(')[0]}</span>
                          <span className="text-xs text-blue-500">{asig.teacherName.match(/\(([^)]+)\)/)?.[1]}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock size={18} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium">
                          {formatEcuadorTime(asig.startTime)} - {formatEcuadorTime(asig.endTime)}
                        </span>
                      </div>
                      
                      {/* Date Display - Different for Single Day vs Semester */}
                      {!asig.isRecurring ? (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                          <span className="font-medium">
                            {formatEcuadorDate(asig.startTime)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                          <span className="font-medium">
                            {startEcuador.toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric',
                              timeZone: 'America/Guayaquil'
                            })} - 
                            {asig.endDate 
                              ? utcToEcuadorTime(new Date(asig.endDate)).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric',
                                  timeZone: 'America/Guayaquil'
                                })
                              : endEcuador.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric',
                                  timeZone: 'America/Guayaquil'
                                })
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Days of Week - Only show for recurring schedules */}
                    {asig.isRecurring && asig.daysOfWeek.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {asig.daysOfWeek.map((d: string) => (
                          <span 
                            key={d} 
                            className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-600 uppercase"
                          >
                            {d.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Admin Actions */}
                    {role === 'ADMIN' && (
                      <div className="mt-auto pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleEdit(asig)}
                          className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(asig.id, lab?.name || 'this schedule')}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Schedule' : 'New Schedule'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingId ? 'Update schedule information' : 'Create a new laboratory schedule'}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Subject Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject / Course *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., System Analysis, Chemistry Lab"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              {/* Schedule Type */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, isRecurring: true})}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  Semester Schedule
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, isRecurring: false})}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${!formData.isRecurring ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  Single Day
                </button>
              </div>
              
              {/* Laboratory Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Laboratory *
                </label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  value={formData.laboratoryId}
                  onChange={(e) => setFormData({...formData, laboratoryId: e.target.value})}
                >
                  <option value="">Select Laboratory...</option>
                  {labs.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.capacity} capacity)
                    </option>
                  ))}
                </select>
              </div>

              {/* Professor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teacher *
                </label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  value={formData.professorId}
                  onChange={(e) => setFormData({...formData, professorId: e.target.value})}
                >
                  <option value="">Select Teacher...</option>
                  {professors.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.startTime}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Time *</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.endTime}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Conflict Warning */}
              {conflictCheck.hasConflict && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Schedule Conflict Detected!</h4>
                      <p className="text-sm text-red-700 mb-2">
                        This laboratory is already reserved during the selected time:
                      </p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {conflictCheck.conflicts.slice(0, 3).map((conflict, index) => {
                          const labName = labs.find(l => l.id === conflict.laboratoryId)?.name || 'Laboratory';
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span>• {labName}: {formatEcuadorTime(conflict.startTime)} - {formatEcuadorTime(conflict.endTime)}</span>
                            </li>
                          );
                        })}
                        {conflictCheck.conflicts.length > 3 && (
                          <li className="text-red-500">+ {conflictCheck.conflicts.length - 3} more conflicts</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              {formData.isRecurring ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Month *</label>
                      <input 
                        type="month" 
                        required 
                        value={formData.startMonthYear}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onChange={(e) => setFormData({...formData, startMonthYear: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Month *</label>
                      <input 
                        type="month" 
                        required 
                        value={formData.endMonthYear}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onChange={(e) => setFormData({...formData, endMonthYear: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Days of Week *</label>
                    <div className="flex flex-wrap gap-2">
                      {daysList.map(d => (
                        <button 
                          key={d.id} 
                          type="button"
                          onClick={() => setFormData(p => ({
                            ...p, 
                            daysOfWeek: p.daysOfWeek.includes(d.id) 
                              ? p.daysOfWeek.filter(x => x !== d.id) 
                              : [...p.daysOfWeek, d.id]
                          }))}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${formData.daysOfWeek.includes(d.id) 
                            ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {formData.daysOfWeek.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please select at least one day</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.singleDate}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={(e) => setFormData({...formData, singleDate: e.target.value})}
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={conflictCheck.hasConflict || loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0`}
              >
                {editingId ? (
                  <>
                    <CheckCircle size={20} />
                    Update Schedule
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Schedule
                  </>
                )}
              </button>
              
              {conflictCheck.hasConflict && (
                <p className="text-sm text-center text-red-600">
                  Please resolve the conflicts before submitting
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;