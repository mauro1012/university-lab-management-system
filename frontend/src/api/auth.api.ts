import axios from 'axios';

// Configuring the Axios instance for the authentication API
export const authApi = axios.create({
  baseURL: 'http://localhost:3000', 
 // headers: {
 //   'Content-Type': 'application/json',
  //},
});

// Interceptor para incluir el token del ADMIN en la petición de registro
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data: any) => authApi.post('/auth/register', data);

// Obtener todos los usuarios
export const getUsers = () => authApi.get('/users');

// Actualizar un usuario existente
export const updateUser = (id: string, data: any) => authApi.patch(`/users/${id}`, data);

// Eliminar un usuario
export const deleteUser = (id: string) => authApi.delete(`/users/${id}`);