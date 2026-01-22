import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/auth.api';
import { User, Shield, KeyRound, CheckCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('error', 'La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    // 2. Validación de Contraseña Fuerte (Regex)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      showNotification('error', 'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial (@$!%*?&).');
      return;
    }

    // 3. Validar que no sea la misma contraseña
    if (formData.oldPassword === formData.newPassword) {
      showNotification('error', 'La nueva contraseña no puede ser igual a la actual.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      showNotification('success', '¡Contraseña actualizada exitosamente!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cambiar la contraseña';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calcular fortaleza de la contraseña
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      
      {/* Notificación Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`bg-gradient-to-r ${notification.type === 'success' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <AlertCircle size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
              <User className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mi Perfil</h1>
              <p className="text-gray-600 text-lg mt-1">Administra tu información personal y seguridad</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <User size={56} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.name || 'Usuario'}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <User size={16} />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                  user?.role === 'ADMIN' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-200 shadow-sm' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-200 shadow-sm'
                }`}>
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Profesor'}
                </span>
                
                {/* Información adicional */}
                <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                  <div className="text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Cuenta verificada</p>
                        <p className="text-xs text-green-600 font-medium">✓ Activa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <KeyRound size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Último cambio</p>
                        <p className="text-xs text-gray-500">Recomendado cada 90 días</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Seguridad */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl">
                  <Lock className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Seguridad y Contraseña</h2>
                  <p className="text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contraseña Actual */}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <KeyRound size={18} className="text-blue-600" />
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Ingresa tu contraseña actual"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500 font-semibold">
                      Nueva Contraseña
                    </span>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Nueva Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        required
                        placeholder="Crea una contraseña segura"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </div>
                    
                    {/* Indicador de Fortaleza */}
                    {formData.newPassword && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Fortaleza de la contraseña:</span>
                          <span className={`text-sm font-bold ${
                            passwordStrength <= 2 ? 'text-red-600' :
                            passwordStrength <= 3 ? 'text-yellow-600' :
                            passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {passwordStrength <= 2 ? 'Débil' :
                             passwordStrength <= 3 ? 'Regular' :
                             passwordStrength <= 4 ? 'Buena' : 'Excelente'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength <= 2 ? 'bg-red-500 w-1/4' :
                              passwordStrength <= 3 ? 'bg-yellow-500 w-1/2' :
                              passwordStrength <= 4 ? 'bg-blue-500 w-3/4' : 'bg-green-500 w-full'
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Confirmar Nueva Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        required
                        placeholder="Repite tu nueva contraseña"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Requisitos de Contraseña */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Requisitos de seguridad:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className={`flex items-center gap-2 ${formData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        formData.newPassword.length >= 8 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {formData.newPassword.length >= 8 ? '✓' : '○'}
                      </div>
                      Al menos 8 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        /[a-z]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
                      </div>
                      Una letra minúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        /[A-Z]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
                      </div>
                      Una letra mayúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        /[0-9]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {/[0-9]/.test(formData.newPassword) ? '✓' : '○'}
                      </div>
                      Un número
                    </li>
                    <li className={`flex items-center gap-2 ${/[@$!%*?&]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        /[@$!%*?&]/.test(formData.newPassword) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {/[@$!%*?&]/.test(formData.newPassword) ? '✓' : '○'}
                      </div>
                      Un carácter especial (@$!%*?&)
                    </li>
                  </ul>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 group ${
                    loading 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-blue-300 hover:shadow-xl'
                  } hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Actualizando contraseña...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Guardar Nueva Contraseña</span>
                    </>
                  )}
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