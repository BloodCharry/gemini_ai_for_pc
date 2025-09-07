import {useState, useRef, useEffect} from 'react';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import InputArea from './components/InputArea';
import ApiStatusIndicator from './components/ApiStatusIndicator';
import {sendMessage, generateImage, analyzeImage, executeCode} from './api';
import {ChatMessage} from './types';

function App() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Привет! Я Gemini, твой AI асистент. Чем я могу помочь вам сегодня?',
            sender: 'ai',
            timestamp: new Date(2023, 0, 1, 10, 42),
            type: 'text'
        }
    ]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async (userMessage: ChatMessage) => {
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await sendMessage(userMessage.text);
            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                text: response.text,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                text: 'Произошла ошибка при обработке запроса. Проверьте подключение к API.',
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageGenerated = async (userMessage: ChatMessage) => {
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const prompt = userMessage.text.replace('/generate', '').trim() || 'abstract art';
            const response = await generateImage(prompt);

            let imageData = response.image;
            // Проверяем, нужно ли добавить префикс для base64
            if (imageData && !imageData.startsWith('data:image')) {
                imageData = `data:image/png;base64,${imageData}`;
            }

            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                text: `Вот сгенерированное изображение по запросу: "${prompt}"`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'image',
                imageData
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error generating image:', error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                text: 'Произошла ошибка при генерации изображения. Проверьте подключение к API.',
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageAnalyzed = async (userMessage: ChatMessage, file: File, question?: string) => {
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await analyzeImage(file, question);
            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                text: response.result,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error analyzing image:', error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                text: 'Произошла ошибка при анализе изображения. Проверьте подключение к API.',
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCodeExecuted = async (userMessage: ChatMessage) => {
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await executeCode(userMessage.text);
            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                text: `Результат выполнения кода для: "${userMessage.text.substring(0, 30)}..."`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'code',
                code: response.code,
                execution_result: response.execution_result
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error executing code:', error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                text: 'Произошла ошибка при выполнении кода. Проверьте подключение к API.',
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    // Прокрутка вниз при обновлении сообщений
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="bg-deep-space text-gray-100 min-h-screen flex flex-col">
            <Header/>
            <ChatContainer
                messages={messages}
                isTyping={isTyping}
                chatContainerRef={chatContainerRef}
            />
            <InputArea
                onSend={handleSendMessage}
                onImageGenerated={handleImageGenerated}
                onImageAnalyzed={handleImageAnalyzed}
                onCodeExecuted={handleCodeExecuted}
            />
            <ApiStatusIndicator/>
        </div>
    );
}

export default App;