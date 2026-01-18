import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { registerUser } from '../../api/auth.api';
import { UserPlus, Shield, GraduationCap, CheckCircle2 } from 'lucide-react';

const UserManagement = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'TEACHER'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await registerUser(formData);
      setSuccess(true);
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'TEACHER' });
      alert('Usuario creado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <UserPlus className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Profesor</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Institucional</label>
                <input
                  type="email"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Temporal</label>
                <input
                  type="password"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Rol</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="TEACHER">Profesor (Teacher)</option>
                  <option value="ADMIN">Administrador (Admin)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center gap-2 p-4 rounded-xl font-bold text-white transition-all ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                  }`}
                >
                  {loading ? 'Procesando...' : 'Crear Cuenta de Usuario'}
                  {!loading && <CheckCircle2 size={20} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;