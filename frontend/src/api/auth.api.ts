import axios from 'axios';

/**
 * Configuración de la instancia de Axios para el servicio de Autenticación.
 * Al incluir '/auth' en la baseURL, todas las funciones simplifican sus rutas
 * y evitamos errores de rutas duplicadas o no encontradas (404).
 */
export const authApi = axios.create({
  baseURL: 'http://localhost:3000/auth', 
});

/**
 * Interceptor para incluir el token JWT en las cabeceras.
 * Esto permite que las rutas protegidas (como las de usuarios) 
 * reconozcan que somos un ADMIN.
 */
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * FUNCIONES DE AUTENTICACIÓN
 * El prefijo '/auth' ya está incluido por la baseURL.
 */

// Iniciar sesión (Login)
// Ruta final: http://localhost:3000/auth/login
export const loginUser = (data: any) => authApi.post('/login', data);

// Registrar un nuevo usuario (ADMIN solamente)
// Ruta final: http://localhost:3000/auth/register
export const registerUser = (data: any) => authApi.post('/register', data);

// Cambiar la contraseña del usuario actual
// Ruta final: http://localhost:3000/auth/change-password
export const changePassword = (data: any) => authApi.post('/change-password', data);


/**
 * FUNCIONES DE GESTIÓN DE USUARIOS
 */

// Obtener la lista de todos los usuarios
// Ruta final: http://localhost:3000/auth/users
export const getUsers = () => authApi.get('/users');

// Actualizar datos de un usuario por ID
// Ruta final: http://localhost:3000/auth/users/:id
export const updateUser = (id: string, data: any) => authApi.patch(`/users/${id}`, data);

// Eliminar un usuario del sistema
// Ruta final: http://localhost:3000/auth/users/:id
export const deleteUser = (id: string) => authApi.delete(`/users/${id}`);

export default authApi;