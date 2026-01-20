import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importamos el contexto
import { 
  Beaker, Plus, Edit, Trash2, 
  Users as UsersIcon, X
} from 'lucide-react';
import { getLaboratories, createLaboratory, updateLaboratory, deleteLaboratory } from '../../api/resource.api';

const LaboratoryManagement = () => {
  const { user } = useAuth(); // Obtenemos el usuario logueado
  const role = user?.role || localStorage.getItem('role');
  
  const [labs, setLabs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 20,
    location: '',
    description: ''
  });

  useEffect(() => { loadLabs(); }, []);

  const loadLabs = async () => {
    try {
      const { data } = await getLaboratories();
      setLabs(data);
    } catch (error) {
      console.error("Error loading labs", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLab(null);
    setFormData({ name: '', capacity: 20, location: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await updateLaboratory(editingLab.id, formData);
      } else {
        await createLaboratory(formData);
      }
      closeModal();
      loadLabs();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al procesar la solicitud");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este laboratorio?")) {
      try {
        await deleteLaboratory(id);
        loadLabs();
      } catch (error: any) {
        alert(error.response?.data?.message || "No se puede eliminar");
      }
    }
  };

  const filteredLabs = labs.filter((lab: any) => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLabs = labs.length;
  const totalCapacity = labs.reduce((sum: number, lab: any) => sum + (lab.capacity || 0), 0);

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Laboratorios</h1>
            <p className="text-gray-500 text-lg mt-1 font-medium">Control de infraestructura y capacidad instalada.</p>
          </div>
          
          {/* BOTÓN SOLO PARA ADMIN */}
          {role === 'ADMIN' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 font-bold text-lg"
            >
              <Plus size={24} strokeWidth={3} /> Nuevo Laboratorio
            </button>
          )}
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Beaker size={32} /></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Laboratorios</p>
              <p className="text-3xl font-black text-gray-800">{totalLabs}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600"><UsersIcon size={32} /></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Capacidad Total</p>
              <p className="text-3xl font-black text-gray-800">{totalCapacity} <span className="text-lg text-gray-400">pers.</span></p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em]">Información Básica</th>
                <th className="px-8 py-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em] text-center">Capacidad</th>
                {role === 'ADMIN' && (
                   <th className="px-8 py-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em] text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLabs.map((lab: any) => (
                <tr key={lab.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div className="bg-white border-2 border-gray-50 p-4 rounded-3xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                        <Beaker size={28} />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-xl tracking-tight">{lab.name}</p>
                        <p className="text-sm text-gray-400 font-medium mt-1">{lab.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl text-sm font-black">
                      <UsersIcon size={16} /> {lab.capacity} pers.
                    </span>
                  </td>
                  
                  {/* COLUMNA DE ACCIONES SOLO PARA ADMIN */}
                  {role === 'ADMIN' && (
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => {
                            setEditingLab(lab);
                            setFormData({
                              name: lab.name,
                              capacity: lab.capacity,
                              location: lab.location,
                              description: lab.description || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-4 text-blue-600 hover:bg-blue-600 hover:text-white rounded-[1.5rem] transition-all duration-300"
                        >
                          <Edit size={22} />
                        </button>
                        <button onClick={() => handleDelete(lab.id)} className="p-4 text-red-500 hover:bg-red-500 hover:text-white rounded-[1.5rem] transition-all duration-300">
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Solo accesible si se abre, y el Admin es quien lo abre */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">
                {editingLab ? 'Editar Lab' : 'Nuevo Registro'}
              </h2>
              <button onClick={closeModal} className="text-gray-300 hover:text-gray-900 transition-colors"><X size={32} strokeWidth={3} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nombre</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-lg shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Capacidad Máxima</label>
                <input 
                  type="number" required value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Ubicación Física</label>
                <input 
                  type="text" required value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-lg"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 text-xl mt-6 active:scale-95"
              >
                {editingLab ? 'Guardar Cambios' : 'Registrar Laboratorio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryManagement;