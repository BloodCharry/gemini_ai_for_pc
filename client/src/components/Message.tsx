import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { ChatMessage } from '../types';
import { FaRobot, FaUser } from 'react-icons/fa';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className={`message-enter flex w-full ${message.sender === 'user' ? 'justify-end' : ''}`}>
      <div className="max-w-3xl w-full lg:w-3/4">
        <div className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''} space-x-3`}>
          {message.sender === 'ai' ? (
            <>
              <div className="logo-circle-smile flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center shadow-neon-cyan">
                <FaRobot className="logo-icon-smile text-white text-sm" />
              </div>
              <div className="bg-glass-dark border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-neon-cyan-sm">
                {message.type === 'image' ? (
                  <div>
                    <p className="text-white mb-2">{message.text}</p>
                    {/* Проверяем, является ли data URL или base64 строкой */}
                    {typeof message.data === 'string' && (
                      <img
                        src={message.data.startsWith('http') ? message.data : `data:image/png;base64,${message.data}`}
                        alt="Generated content"
                        className="rounded-lg max-w-full h-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/fallback-image.png';
                        }}
                      />
                    )}
                  </div>
                ) : message.type === 'code' ? (
                  <div>
                    <p className="text-white mb-2">{message.text}</p>
                    <div className="bg-gray-900 rounded-lg p-3 mb-2">
                      <pre className="text-xs text-neon-cyan overflow-x-auto">
                        {message.data.code}
                      </pre>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <pre className="text-xs text-white overflow-x-auto">
                        {message.data.execution_result}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-white">{message.text}</p>
                )}
                <div className="text-xs text-gray-400 mt-1 flex items-center">
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <FiCheck className="ml-2 text-neon-blue" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-neon-blue to-neon-magenta rounded-2xl rounded-tr-none px-4 py-3 shadow-neon-blue-sm">
                <p className="text-white">{message.text}</p>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <FiCheck className="ml-2 text-white" />
                </div>
              </div>
              <div className="logo-circle-smile-off flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-magenta flex items-center justify-center shadow-neon-blue">
                <FaUser className="text-white text-sm" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;