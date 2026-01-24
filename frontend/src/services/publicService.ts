import axios from 'axios';

// El DNS del Application Load Balancer (ALB) de tu Fase 4 de Terraform
const ALB_DNS = "http://qa-alb-1176272014.us-east-1.elb.amazonaws.com";

// IMPORTANTE: Cambié el nombre a VITE_API_RESOURCE_URL para que coincida con tu captura de Vercel
const NEST_API = import.meta.env.VITE_API_RESOURCE_URL || `${ALB_DNS}/resource`;
const GO_API = import.meta.env.VITE_GO_API_URL || ALB_DNS;

export const publicService = {
  // Trae las asignaciones (NestJS) desde AWS
  getAssignments: async () => {
    const resp = await axios.get(`${NEST_API}/assignments/public/today`);
    return resp.data;
  },
  // Trae los estados de Redis (Go) desde AWS
  getAllStatuses: async () => {
    const resp = await axios.get(`${GO_API}/public/status/all`);
    return resp.data;
  }
};