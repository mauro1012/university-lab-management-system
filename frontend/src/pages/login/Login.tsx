import React, { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const data = response.data;

      // 1. Extraemos el token de cualquier lugar posible
      const token = data.accessToken || data.token || data.access_token;
      
      // 2. Buscamos el rol. Revisamos en data.user.role o en data.role directamente
      const role = data.user?.role || data.role;
      
      
      // 3. Creamos el objeto de usuario con el ID obligatorio para TypeScript
      const userData = {
        id: data.user?.id || data.id || 'temp-id', // Extraemos el id real del backend
        email: data.user?.email || email,
        role: role
      };

      if (token && role) {
        console.log("Login exitoso. Rol:", role);
        // Ahora el objeto cumple con la interfaz 'User' al tener id, email y role
        login(token, userData as any); 
        navigate('/dashboard');
      } else {
        // Si llegamos aquí, es que el backend no mandó el campo 'role'
        console.error('Datos recibidos del backend:', data);
        alert('El servidor no devolvió el rol del usuario. Contacta al administrador.');
      }
    } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
      alert('Credenciales incorrectas o error de servidor.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">University Lab</h2>
          <p className="text-gray-500 mt-2">Gestión de Inventario y Laboratorios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="nombre@universidad.edu" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md active:transform active:scale-95"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Sistema de Gestión de Microservicios v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;