import React, { useState, useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';

const ApiStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Используем timeout для предотвращения зависания
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkApiConnection();
    const interval = setInterval(checkApiConnection, 30000); // Проверять каждые 30 секунд

    return () => {
      clearInterval(interval);
    };
  }, [API_URL]);

  return (
    <div className="  footer-width-api fixed bottom-4 right-4 flex items-center space-x-2 bg-glass-dark p-2 rounded-full border border-gray-700 glass-effect">
      <div className={`w-3 h-3 rounded-full ${
        isConnected === null ? 'bg-gray-400' : 
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}>
        <FaCircle className="w-full h-full" />
      </div>
      <span className="text-xs text-gray-400">
        {isConnected === null ? 'Проверка подключения...' :
         isConnected ? 'API подключен' : 'API недоступен'}
      </span>
    </div>
  );
};

export default ApiStatusIndicator;