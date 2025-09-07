import React, {useState, useRef, useEffect} from 'react';
import {FiMic, FiPaperclip, FiSend} from 'react-icons/fi';
import {ChatMessage} from '../types';
import {IoPaperPlaneOutline} from 'react-icons/io5';

// Интерфейс для пропсов
interface InputAreaProps {
    onSend: (message: ChatMessage) => void;
    onImageGenerated: (message: ChatMessage) => void;
    onImageAnalyzed: (message: ChatMessage, file: File, question?: string) => void;
    onCodeExecuted: (message: ChatMessage) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
                                                 onSend,
                                                 onImageGenerated,
                                                 onImageAnalyzed,
                                                 onCodeExecuted
                                             }) => {
    const [inputText, setInputText] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Автоматическая настройка высоты текстовой области
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputText]);

    const handleSend = () => {
        if (inputText.trim()) {
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                text: inputText,
                sender: 'user',
                timestamp: new Date(),
                type: 'text'
            };

            onSend(userMessage);
            setInputText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const question = prompt('Что вы хотите спросить об этом изображении?', 'Что изображено на этой картинке?');
            handleFileUpload(file, question || undefined);
        }
    };

    const handleFileUpload = async (file: File, question?: string) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: question || 'Что изображено на этой картинке?',
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        };

        // Сначала проверяем, не является ли файл изображением
        if (file.type.startsWith('image/')) {
            // Если текст содержит команду для генерации изображения
            if (inputText.toLowerCase().includes('/generate') || inputText.toLowerCase().includes('сгенерировать')) {
                // Создаем специальное сообщение для генерации изображения
                const generateMessage: ChatMessage = {
                    id: Date.now().toString(),
                    text: inputText.replace('/generate', '').trim() || 'abstract art',
                    sender: 'user',
                    timestamp: new Date(),
                    type: 'text'
                };
                onImageGenerated(generateMessage);
            } else {
                // Иначе анализируем изображение
                onImageAnalyzed(userMessage, file, question);
            }
        } else {
            // Если это не изображение, возможно, это код
            onCodeExecuted(userMessage);
        }

        // Очищаем поле ввода после обработки файла
        setInputText('');
    };

    return (
        <div
      className={`footer-width mt-auto glass-effect bg-glass-dark rounded-full shadow-lg transition-all duration-300 input-wrapper ${
        isFocused ? 'focused' : ''
      }`}
        >
            <div className="flex items-center px-3 py-2">
                {/* Скрытый input для файлов */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Иконка «скрепка» */}
                <button
                    onClick={handleAttachClick}
                    className="
            btn-icon settings rounded-full
            hover:bg-glass-light transition-all duration-300
            text-neon-blue glow-on-hover
          "
                >
                    <FiPaperclip size={16}/>
                </button>

                {/* Поле ввода */}
                <div className="flex-1 relative max-w-[60%] mx-2">
          <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Задайте вопрос... (используйте /generate для генерации картинок)"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="
              w-full bg-transparent
              placeholder-white text-white text-sm
              border-0 focus:ring-0 focus:outline-none
              resize-none py-2 px-3 max-h-32
            "
          />
                </div>

                {/* Иконка «микрофон» */}
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    onMouseDown={() => setIsVoiceActive(true)}
                    onMouseUp={() => setIsVoiceActive(false)}
                    onMouseLeave={() => setIsVoiceActive(false)}
                    className={`
            btn-icon dark-toggle rounded-full
            hover:bg-glass-light transition-all duration-300
            text-neon-magenta glow-on-hover
            ${isRecording ? 'voice-active' : ''}
          `}
                >
                    <FiMic size={16}/>
                </button>

                {/* Кнопка отправки */}
                <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="
            logo-circle send-button rounded-full
            transition-all duration-300 pulse-effect
            hover:shadow-neon-blue-sm
          "
                >
                    <IoPaperPlaneOutline className="send-icon"/>
                </button>
            </div>
        </div>

    );
};

export default InputArea;