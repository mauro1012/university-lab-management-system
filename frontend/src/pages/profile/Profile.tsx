import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/auth.api';
import { User, Shield, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("La nueva contraseña y la confirmación no coinciden.");
    }

    // 2. Validación de Contraseña Fuerte (Regex)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      return alert('La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial.');
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      alert('Contraseña actualizada con éxito');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información del Usuario */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name || 'Usuario'}</h2>
              <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Formulario de Seguridad */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <KeyRound className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                  />
                </div>

                <hr className="my-4 border-gray-100" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                  {!loading && <CheckCircle size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;