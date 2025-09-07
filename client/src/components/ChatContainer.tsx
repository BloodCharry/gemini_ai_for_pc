import React from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import {ChatMessage as MessageType } from '../types';

// Интерфейс для пропсов
interface ChatContainerProps {
  messages: MessageType[];
  isTyping: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const HatOntainer: React.FC<ChatContainerProps> = ({
  messages,
  isTyping,
  chatContainerRef
}) => {
  return (
    <main className="main-none flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
      <div
        ref={chatContainerRef}
        id="chat-container"
        className="p-3 flex-1 overflow-y-auto mb-4 space-y-6 custom-scrollbar"
      >
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </main>
  );
};

export default HatOntainer;