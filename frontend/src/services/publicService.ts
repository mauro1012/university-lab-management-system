import axios from 'axios';

// 1. Definimos la base limpia del ALB
const ALB_BASE = "http://qa-alb-1176272014.us-east-1.elb.amazonaws.com";

// 2. NestJS (Auth/Resource) entran por el puerto 80 (default) usando el prefijo /resource
// Si la variable de Vercel es "http://.../resource", el código funcionará.
const NEST_API = import.meta.env.VITE_API_RESOURCE_URL || `${ALB_BASE}/resource`;

// 3. Go (Monitoring) entra por el puerto 8081 obligatoriamente
const GO_API = import.meta.env.VITE_GO_API_URL || `${ALB_BASE}:8081`;

export const publicService = {
  // Trae las asignaciones (NestJS - Puerto 80)
  getAssignments: async () => {
    // Esto resultará en: http://...amazonaws.com/resource/assignments/public/today
    const resp = await axios.get(`${NEST_API}/assignments/public/today`);
    return resp.data;
  },

  // Trae los estados de Redis (Go - Puerto 8081)
  getAllStatuses: async () => {
    // Esto resultará en: http://...amazonaws.com:8081/public/status/all
    const resp = await axios.get(`${GO_API}/public/status/all`);
    return resp.data;
  }
};