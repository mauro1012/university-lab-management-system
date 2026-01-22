import axios from 'axios';

const resourceApi = axios.create({
  // CAMBIO CLAVE: Añadir /resource al final de la URL
  baseURL: 'http://localhost:3001/resource', 
});

// Interceptor para incluir el token JWT (Esto está perfecto, no lo toques)
resourceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ahora estas rutas llamarán automáticamente a /resource/laboratories, etc.
export const getLaboratories = () => resourceApi.get('/laboratories');
export const createLaboratory = (data: any) => resourceApi.post('/laboratories', data);
export const updateLaboratory = (id: string, data: any) => resourceApi.patch(`/laboratories/${id}`, data);
export const deleteLaboratory = (id: string) => resourceApi.delete(`/laboratories/${id}`);

export const getAssignments = () => resourceApi.get('/assignments');
export const createAssignment = (data: any) => resourceApi.post('/assignments', data);
export const deleteAssignment = (id: string) => resourceApi.delete(`/assignments/${id}`);

export default resourceApi;