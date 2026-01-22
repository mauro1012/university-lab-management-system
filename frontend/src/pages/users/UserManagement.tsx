import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { registerUser, getUsers, deleteUser, updateUser } from '../../api/auth.api';
import { 
  UserPlus, Users, Trash2, Edit, CheckCircle, X, UserCheck, 
  Mail, Lock, UserCircle, Shield, Search, Filter, AlertCircle,
  ChevronRight
} from 'lucide-react';

// Definir interfaz para el formulario
interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Definir interfaz para los datos de actualización (sin password obligatorio)
interface UpdateUserData {
  email: string;
  password?: string; // Hacer password opcional
  firstName: string;
  lastName: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Estado inicial del formulario con campos vacíos
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'TEACHER'
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error loading users", error);
      showNotification('error', 'Error loading users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Limpiar formulario al cargar la página
  useEffect(() => {
    resetForm();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'TEACHER'
    });
  };

  const handleEditClick = (user: any) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '', // Mantener la contraseña vacía por seguridad
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm(); // Usar resetForm en lugar de setear manualmente
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      showNotification('error', 'First and last names must contain only letters.');
      return;
    }

    if (!editingId && !passwordRegex.test(formData.password)) {
      showNotification('error', 'Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Crear un nuevo objeto sin la propiedad password si está vacía
        const updateData: UpdateUserData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        };
        
        // Solo incluir password si no está vacío
        if (formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        
        await updateUser(editingId, updateData);
        showNotification('success', 'User updated successfully');
      } else {
        await registerUser(formData);
        showNotification('success', 'User created successfully');
      }
      
      cancelEdit(); // Esto limpiará el formulario
      fetchUsers(); 
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Operation error';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await deleteUser(id);
        showNotification('success', 'User deleted successfully');
        fetchUsers();
      } catch (error) {
        showNotification('error', 'Could not delete user');
      }
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const teacherUsers = users.filter(u => u.role === 'TEACHER').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
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

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
              <p className="text-gray-600 text-lg mt-1">Manage system users, roles, and permissions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalUsers}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Administrators</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{adminUsers}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <Shield className="text-purple-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Teachers</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{teacherUsers}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <UserCircle className="text-emerald-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl border shadow-sm transition-all ${editingId ? 'border-orange-300 ring-1 ring-orange-100' : 'border-gray-200/50'} sticky top-8`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${editingId ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {editingId ? <Edit size={22} /> : <UserPlus size={22} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingId ? 'Edit User' : 'New User'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {editingId ? 'Update user information' : 'Add a new user to the system'}
                    </p>
                  </div>
                </div>
                {editingId && (
                  <button 
                    onClick={cancelEdit}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text" 
                      placeholder="John"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text" 
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email" 
                      placeholder="user@university.edu"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {!editingId && '*'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password" 
                      placeholder={editingId ? "Leave blank to keep current" : "Enter strong password"}
                      required={!editingId}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  {!editingId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Must include uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 group ${
                    editingId 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-300 hover:shadow-xl' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-blue-300 hover:shadow-xl'
                  } hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {editingId ? <UserCheck size={20} /> : <CheckCircle size={20} />}
                      <span>{editingId ? 'Update User' : 'Register User'}</span>
                      <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              {/* Table Header with Search */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-2.5 rounded-xl">
                      <Users className="text-purple-600" size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Registered Users</h2>
                      <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full">
                    <span className="text-sm font-bold text-blue-700">{users.length} Total</span>
                  </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="ADMIN">Administrators</option>
                      <option value="TEACHER">Teachers</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Information</div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</div>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="text-gray-300 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
                            <p className="text-gray-500 max-w-md">
                              {searchTerm || roleFilter !== 'all' 
                                ? 'No users match your search criteria' 
                                : 'No users available. Register your first user.'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-blue-50/20 transition-colors ${editingId === user.id ? 'bg-orange-50/50 border-l-4 border-l-orange-500' : ''}`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                <UserCircle className={user.role === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'} size={24} />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{user.firstName} {user.lastName}</h3>
                                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                                  <Mail size={14} />
                                  <span>{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                              user.role === 'ADMIN' 
                                ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200' 
                                : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {user.role === 'ADMIN' && <Shield size={14} />}
                              {user.role === 'TEACHER' && <UserCircle size={14} />}
                              {user.role === 'ADMIN' ? 'Administrator' : 'Teacher'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center gap-3">
                              <button 
                                onClick={() => handleEditClick(user)}
                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl hover:scale-105 transition-all duration-200"
                                title="Edit user"
                              >
                                <Edit size={20} />
                              </button>
                              <button 
                                onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl hover:scale-105 transition-all duration-200"
                                title="Delete user"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{filteredUsers.length}</span> of <span className="font-semibold text-gray-700">{users.length}</span> users
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Teacher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;