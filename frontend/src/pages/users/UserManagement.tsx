import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { registerUser, getUsers, deleteUser, updateUser } from '../../api/auth.api';
// IMPORTACIÓN CORREGIDA: Agregamos X, UserCheck y CheckCircle
import { UserPlus, Users, Trash2, Edit, CheckCircle, X, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'TEACHER'
  });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: any) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '', 
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'TEACHER' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      return alert('Nombres y apellidos solo deben contener letras.');
    }

    if (!editingId && !passwordRegex.test(formData.password)) {
      return alert('La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y símbolo.');
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateUser(editingId, formData);
        alert('Usuario actualizado exitosamente');
      } else {
        await registerUser(formData);
        alert('Usuario creado exitosamente');
      }
      
      cancelEdit();
      fetchUsers(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert('No se pudo eliminar el usuario');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${editingId ? 'border-orange-400 ring-1 ring-orange-100' : 'border-gray-200'} sticky top-8`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  {editingId ? <Edit className="text-orange-500" /> : <UserPlus className="text-blue-600" />}
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                </div>
                {editingId && (
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-red-500">
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text" placeholder="Nombre" required
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                <input
                  type="text" placeholder="Apellido" required
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
                <input
                  type="email" placeholder="Correo @universidad.edu" required
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                  type="password" 
                  placeholder={editingId ? "Dejar en blanco para no cambiar" : "Contraseña fuerte"} 
                  required={!editingId}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <select
                  className="w-full p-2.5 border rounded-lg outline-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="TEACHER">Profesor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button
                  type="submit" disabled={loading}
                  className={`w-full p-3 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${
                    editingId 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Procesando...' : (editingId ? 'Actualizar Usuario' : 'Registrar')}
                  {editingId ? <UserCheck size={18} /> : <CheckCircle size={18} />}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Users className="text-gray-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Usuarios Registrados</h2>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">
                  {users.length} Total
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Usuario</th>
                      <th className="px-6 py-4 font-semibold">Rol</th>
                      <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${editingId === u.id ? 'bg-orange-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{u.firstName} {u.lastName}</span>
                            <span className="text-sm text-gray-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-black ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => handleEditClick(u)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;