import React from 'react';
import { FaRobot } from 'react-icons/fa';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full">
      <div className="max-w-3xl w-full lg:w-3/4">
        <div className="flex items-start space-x-3">
          <div className="logo-circle-smile flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center shadow-neon-cyan">
            <FaRobot className="logo-icon-smile text-white text-sm" />
          </div>
          <div className="bg-glass-dark border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 w-20">
            <div className="typing-indicator flex justify-center">
              <span className="w-2 h-2 rounded-full bg-neon-cyan mx-1 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-neon-cyan mx-1 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-neon-cyan mx-1 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;