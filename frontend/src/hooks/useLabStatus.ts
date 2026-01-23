import { useState, useEffect, useCallback } from 'react';
import { statusService } from '../services/statusService';

export const useLabStatus = (labId: string) => {
  const [data, setData] = useState({
    status: 'AVAILABLE',
    time_left_minutes: 0,
    loading: true,
    error: false,
    lastUpdated: null as string | null
  });

  // Usamos useCallback para que la función sea estable y no cause loops infinitos
  const updateStatus = useCallback(async () => {
    try {
      // No ponemos loading: true aquí para que la pantalla no parpadee cada 30s
      const result = await statusService.getLabStatus(labId);
      setData({
        status: result.status,
        time_left_minutes: result.time_left_minutes,
        loading: false,
        error: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(`Error consultando estado de lab ${labId}:`, err);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: true, 
        status: 'OFFLINE' 
      }));
    }
  }, [labId]);

  useEffect(() => {
    updateStatus(); // Carga inicial
    
    // Polling: consulta a Go cada 30 segundos
    const interval = setInterval(updateStatus, 30000);
    
    return () => clearInterval(interval);
  }, [updateStatus]);

  // IMPORTANTE: Retornamos la función updateStatus para que el botón de Check-in la use
  return { ...data, updateStatus };
};