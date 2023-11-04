import { useState, useEffect } from 'react';

const useWebSocket = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        if (ws === null) { // Проверьте, что сокет не был инициализирован ранее
            const socket = new WebSocket('ws://localhost:8000/ws'); // Укажите правильный адрес сервера

            socket.onopen = () => {
                console.log('WebSocket Client Connected');
                setWs(socket);
            };

            socket.onmessage = (event) => {
                setResponse(event.data);
            };

            socket.onclose = () => {
                console.log('WebSocket Client Closed');
                setWs(null); // Убедитесь, что сокет обнуляется только после закрытия
            }
        }

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    const handleSend = () => {
        if (ws && message) {
            ws.send(message);
            setMessage('');
        }
    };

    return { message, setMessage, response, handleSend };
};

export default useWebSocket;
