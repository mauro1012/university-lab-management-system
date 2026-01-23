const GO_API_URL = import.meta.env.VITE_GO_API_URL || "http://localhost:8081";

export const statusService = {
  // 1. Consulta el estado (Público)
  getLabStatus: async (labId: string) => {
    try {
      const response = await fetch(`${GO_API_URL}/public/status/${labId}`);
      if (!response.ok) throw new Error("Error al obtener estado");
      return await response.json();
    } catch (error) {
      console.error("Error en getLabStatus:", error);
      throw error;
    }
  },

  // 2. Iniciar Clase (Check-in)
  checkInLab: async (labId: string, duration: number) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${GO_API_URL}/checkin/${labId}`, { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      // CORRECCIÓN PARA EL ERROR 400: 
      // Cambiamos "duration_minutes" por "duration" (estándar en Go Gin)
      body: JSON.stringify({ 
        duration: duration 
      })
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Error ${response.status}: ${errorDetail || 'Bad Request'}`);
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  },

  // 3. Terminar Clase (Check-out)
checkOutLab: async (labId: string) => {
  const token = localStorage.getItem('token');
  
  // Usamos la misma estructura /checkout/:id que definimos en Go
  const response = await fetch(`${GO_API_URL}/checkout/${labId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
    // No necesita body, el ID va en la URL
  });

  if (!response.ok) throw new Error("No se pudo liberar el laboratorio");

  return { success: true };
}
};