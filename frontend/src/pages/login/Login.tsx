import React, { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica del cliente
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.post('/login', { email, password });
      const data = response.data;

      const token = data.accessToken || data.token || data.access_token;
      const role = data.user?.role || data.role;
      
      const userData = {
        id: data.user?.id || data.id || 'temp-id',
        email: data.user?.email || email,
        role: role,
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || ''
      };

      if (token && role) {
        setSuccessMessage('Login successful!');
        
        // Redirección inmediata sin timeout
        login(token, userData as any);
        navigate('/dashboard');
      } else {
        console.error('Backend response data:', data);
        setError('Server authentication error. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error: any) {
      let errorMsg = 'Invalid credentials or server error';
      
      if (error.response) {
        // Error del servidor con respuesta
        if (error.response.status === 401) {
          errorMsg = 'Invalid email or password';
        } else if (error.response.status === 400) {
          errorMsg = 'Invalid request format';
        } else if (error.response.status === 404) {
          errorMsg = 'Server not available';
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.request) {
        // Error de red (sin respuesta)
        errorMsg = 'Network error. Check your connection.';
      } else {
        // Error en la configuración de la solicitud
        errorMsg = 'Request configuration error';
      }
      
      console.error('Login error:', errorMsg);
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para limpiar mensajes de error
  const clearError = () => {
    setError('');
  };

  // Función para limpiar mensaje de éxito
  const clearSuccess = () => {
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Success Message */}
        {successMessage && (
          <div className="absolute -top-20 left-0 right-0 animate-in slide-in-from-top z-50">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span className="font-semibold">{successMessage}</span>
              </div>
              <button 
                onClick={clearSuccess}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Error Message - Más visible y con botón para cerrar */}
        {error && (
          <div className="absolute -top-20 left-0 right-0 animate-in slide-in-from-top z-50">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-semibold">{error}</span>
              </div>
              <button 
                onClick={clearError}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="p-8 bg-gradient-to-r from-blue-600 to-cyan-500">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Shield className="text-white" size={28} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">LabOS Platform</h1>
                <p className="text-white/80 text-sm font-medium">University Laboratory Management System</p>
              </div>
            </div>
            <div className="text-center">
              <Sparkles className="text-white/60 mx-auto" size={20} />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your laboratory dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-gray-400" />
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                </div>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="you@university.edu" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError(); // Limpiar error al escribir
                    }}
                    className="w-full px-12 py-4 bg-gray-50/50 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-gray-400" />
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError(); // Limpiar error al escribir
                    }}
                    className="w-full px-12 py-4 bg-gray-50/50 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 pr-12"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t border-gray-200/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                  <Shield size={14} />
                  <span>Secure Authentication</span>
                </div>
                <p className="text-xs text-gray-400">
                  LabOS v2.0 • Enterprise Laboratory Management Platform
                </p>
                <div className="mt-4 flex items-center justify-center gap-1">
                  {['🔒', '⚡', '📊', '🔬'].map((emoji, i) => (
                    <span key={i} className="text-sm opacity-60">{emoji}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/50 border-t border-gray-200/30 px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs text-gray-500">
                <span className="font-medium">© {new Date().getFullYear()} University Labs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-70">
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
            <div className="text-2xl mb-2">🔬</div>
            <p className="text-xs font-medium text-gray-700">Laboratory Management</p>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-xs font-medium text-gray-700">Schedule Control</p>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-xs font-medium text-gray-700">User Management</p>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs font-medium text-gray-700">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* CSS for blob animation in a separate style tag */}
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
    </div>
  );
};

export default Login;