import axios from 'axios';

const resourceApi = axios.create({
  baseURL: 'http://localhost:3001', // Puerto del Resource Service
});

// Interceptor para incluir el token JWT en cada petición
resourceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getLaboratories = () => resourceApi.get('/laboratories');
export const createLaboratory = (data: any) => resourceApi.post('/laboratories', data);
export const updateLaboratory = (id: string, data: any) => resourceApi.patch(`/laboratories/${id}`, data);
export const deleteLaboratory = (id: string) => resourceApi.delete(`/laboratories/${id}`);

export default resourceApi;