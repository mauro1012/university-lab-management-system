import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Beaker, Plus, Edit, Trash2, 
  Users as UsersIcon, X, Search,
  CheckCircle, AlertCircle, Building,
  MapPin, Filter
} from 'lucide-react';
import { getLaboratories, createLaboratory, updateLaboratory, deleteLaboratory } from '../../api/resource.api';

const LaboratoryManagement = () => {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  
  const [labs, setLabs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 20,
    location: '',
    description: ''
  });

  useEffect(() => { 
    loadLabs();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadLabs = async () => {
    try {
      setLoading(true);
      const { data } = await getLaboratories();
      setLabs(data);
    } catch (error) {
      console.error("Error loading laboratories", error);
      showNotification('error', 'Error loading laboratories');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLab(null);
    setFormData({ 
      name: '', 
      capacity: 20, 
      location: '', 
      description: ''
    });
    setNotification(null); // Limpiar notificación al cerrar modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await updateLaboratory(editingLab.id, formData);
        showNotification('success', 'Laboratory updated successfully!');
      } else {
        await createLaboratory(formData);
        showNotification('success', 'Laboratory created successfully!');
      }
      setTimeout(() => {
        closeModal();
        loadLabs();
      }, 1500); // Dar tiempo para ver la notificación antes de cerrar
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error processing request';
      showNotification('error', errorMsg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete laboratory "${name}"?`)) {
      try {
        await deleteLaboratory(id);
        showNotification('success', 'Laboratory deleted successfully!');
        loadLabs();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Cannot delete laboratory';
        showNotification('error', errorMsg);
      }
    }
  };

  const filteredLabs = labs.filter((lab: any) => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lab.description && lab.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalLabs = labs.length;
  const totalCapacity = labs.reduce((sum: number, lab: any) => sum + (lab.capacity || 0), 0);

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Notification Toast - Solo cuando el modal NO está abierto */}
        {notification && !isModalOpen && (
          <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right">
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

        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-3 rounded-xl shadow-lg">
                  <Beaker className="text-white" size={24} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Laboratory Management</h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl">
                Manage laboratory infrastructure, capacity, and scheduling resources.
              </p>
            </div>
            
            {/* ADMIN ONLY - Add New Button */}
            {role === 'ADMIN' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300 font-bold text-lg shadow-lg group"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                New Laboratory
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Laboratories</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalLabs}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <Beaker size={28} className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span>Active laboratories in the system</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Capacity</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalCapacity}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <UsersIcon size={28} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span>Total seating capacity across all labs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search laboratories by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                <Filter size={18} />
                <span className="font-medium">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Laboratories Table */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200/50">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Laboratory Information</div>
                  </th>
                  <th className="px-6 py-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</div>
                  </th>
                  <th className="px-6 py-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</div>
                  </th>
                  {role === 'ADMIN' && (
                    <th className="px-6 py-5 text-right">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {loading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : filteredLabs.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'ADMIN' ? 4 : 3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Beaker className="text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No laboratories found</h3>
                        <p className="text-gray-500 max-w-md">
                          {searchTerm ? `No results for "${searchTerm}". Try a different search term.` : 'No laboratories available. Create your first laboratory.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLabs.map((lab: any) => (
                    <tr key={lab.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl group-hover:scale-105 transition-transform">
                            <Building className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{lab.name}</h3>
                            {lab.description && (
                              <p className="text-gray-600 text-sm mt-1 max-w-md">{lab.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <UsersIcon size={18} className="text-gray-400" />
                          <span className="font-bold text-gray-900">{lab.capacity}</span>
                          <span className="text-gray-500 text-sm">seats</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{lab.location}</span>
                        </div>
                      </td>
                      
                      {/* ADMIN ACTIONS COLUMN */}
                      {role === 'ADMIN' && (
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
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
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl hover:scale-105 transition-all duration-200"
                              title="Edit laboratory"
                            >
                              <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => handleDelete(lab.id, lab.name)}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl hover:scale-105 transition-all duration-200"
                              title="Delete laboratory"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Showing <span className="font-semibold text-gray-700">{filteredLabs.length}</span> of <span className="font-semibold text-gray-700">{labs.length}</span> laboratories
        </div>
      </div>

      {/* Modal - Laboratory Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200/50 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingLab ? 'Edit Laboratory' : 'New Laboratory'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {editingLab ? 'Update laboratory information' : 'Add a new laboratory to the system'}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Notification dentro del modal */}
            {notification && (
              <div className="mx-6 mt-4 animate-in slide-in-from-top">
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
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Laboratory Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Chemistry Lab, Physics Lab"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Capacity *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Number of seats"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Building A, Room 204"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Optional: Equipment, special features, notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!!notification && notification.type === 'success'} // Deshabilitar si ya fue exitoso
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingLab ? 'Save Changes' : 'Create Laboratory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryManagement;