import React, { useState } from 'react';
import { statusService } from '../../services/statusService';

interface Props {
  labId: string;
  labName: string;
  onSuccess?: () => void;
}

export const LabCheckInForm = ({ labId, labName, onSuccess }: Props) => {
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validación adicional
    if (duration < 1 || duration > 300) {
      setError('La duración debe estar entre 1 y 300 minutos');
      setLoading(false);
      return;
    }

    try {
      await statusService.checkInLab(labId, duration);
      
      const successMsg = `✓ Laboratorio ${labName} ahora está OCUPADO por ${duration} minutos`;
      setSuccessMessage(successMsg);
      
      // Usar setTimeout para mensajes de éxito que desaparecen
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? `Error: ${error.message}`
        : 'Error al marcar el laboratorio';
      
      setError(errorMsg);
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 300) {
      setDuration(numValue);
    }
  };

  const durationPresets = [30, 45, 60, 90, 120];

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Iniciar Clase: <span className="text-blue-700">{labName}</span>
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleCheckIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración de la clase
          </label>
          
          {/* Presets rápidos */}
          <div className="flex flex-wrap gap-2 mb-3">
            {durationPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDuration(preset)}
                className={`px-3 py-1 text-sm rounded transition ${
                  duration === preset
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                {preset} min
              </button>
            ))}
          </div>

          {/* Input personalizado */}
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="15"
              max="300"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="flex-1"
              disabled={loading}
            />
            <div className="relative w-24">
              <input
                type="number"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-center"
                min="1"
                max="300"
                disabled={loading}
                aria-label="Duración en minutos"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">min</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Selecciona entre 15 y 300 minutos
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            '📋 OCUPAR LABORATORIO'
          )}
        </button>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          <p>Al confirmar, el laboratorio cambiará a estado "OCUPADO" y se mostrará en tiempo real.</p>
        </div>
      </form>
    </div>
  );
};