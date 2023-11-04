import React, { useState, useEffect } from "react";
import { AudioRecorder } from 'react-audio-voice-recorder';
import useWebSocket from './WebSocketClient';
import TypingText from  './TextTyping'


const AudioRecorderComponent = () => {
    const { message, setMessage, response, handleSend } = useWebSocket();
    const [isMessageSent, setIsMessageSent] = useState(true);
    const [responses, setResponses] = useState([]); // Массив для хранения ответов
    const [answers, setAnswers] = useState([]); // Массив для хранения ответов
    const [order, setOrder] = useState(1); // Initialize order to 1
    const [question_id, setQuestion] = useState()


    const handleSendMessage = async () => {
        if (message) {
            const url = 'http://127.0.0.1:8000/send-text/';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text_message: message }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Сервер ответил:", data);
                    setOrder(1)
                    if (data.id) {
                        // Если есть "id" в ответе, отправляем его через WebSocket в формате {"get_processed_text": data.id}
                        setMessage(`{"get_processed_text": "${data.id}"}`);
                        setIsMessageSent(false); // Устанавливаем флаг, что сообщение отправлено
                        setQuestion(data.id)
                    }
                    // Вы можете обработать ответ от сервера, если необходимо.
                } else {
                    console.error('Произошла ошибка при отправке сообщения');
                    // Вы можете обработать ошибку, если необходимо.
                }
            } catch (error) {
                console.error('Произошла ошибка при отправке сообщения: ' + error);
                // Вы можете обработать ошибку, если необходимо.
            }
        }
    };


    const uploadAudio = async (blob) => {
        const uniqueFilename = `recording_${Date.now()}.webm`;
        const formData = new FormData();
        formData.append("file", blob, uniqueFilename);

        try {
            const response = await fetch("http://127.0.0.1:8000/upload-audio", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Сервер ответил:", data);
                setOrder(1)
                if (data.id) {
                    // Если есть "id" в ответе, отправляем его через WebSocket в формате {"get_processed_text": data.id}
                    setMessage(`{"get_processed_text": "${data.id}"}`);
                    setIsMessageSent(false); // Устанавливаем флаг, что сообщение отправлено
                    setQuestion(data.id)
                }
            } else {
                console.error("Ошибка при отправке на сервер:", response.statusText);
            }
        } catch (error) {
            console.error("Ошибка при отправке на сервер:", error);
        }
    };

    useEffect(() => {
        if (response) {
            const responseData = JSON.parse(response);
            // console.log(responseData)

            if (responseData.audio_link) {
                // Воспроизводим аудио
                const audio = new Audio(responseData.audio_link);
                audio.play();
                audio.addEventListener("ended", () => {
                    setTimeout(() => {
                        setIsMessageSent(false); // Устанавливаем флаг после окончания воспроизведения
                    }, 100);
                });
            } else {
                // Если нет аудио, можно добавить соответствующую логику здесь
                setIsMessageSent(false); // Например, сразу устанавливаем флаг в false
            }

            if (responseData.message_text) {
                setAnswers((setAnswers) => [
                    ...setAnswers,
                    `${responseData.message_text}`
                ]);
            } else if (responseData.question_text) {
                setResponses((prevResponses) => [
                    ...prevResponses,
                    `Вы: ${responseData.question_text}`
                ]);
            }

            if (responseData.last_in_list !== true) {
                setOrder((prevOrder) => prevOrder + 1); // Увеличиваем order
                // Если "last_in_list" равно false, повторяем запрос
                setMessage(`{"get_answer": "${question_id}", "order": ${order}}`);
            } else {
                // Если "last_in_list" равно true, завершаем процесс
                // Здесь вы можете выполнить необходимые действия при завершении
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);


    useEffect(() => {
        // Следим за изменением message и отправляем его через WebSocket
        if (!isMessageSent) {
            handleSend();
            setIsMessageSent(true); // Сбрасываем флаг после отправки
        }
    }, [message, isMessageSent, handleSend]);


    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Введите ваше сообщение"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Отправить сообщение</button>
            </div>
            <AudioRecorder
                onRecordingComplete={uploadAudio}
                audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                }}
                downloadOnSavePress={false}
                downloadFileExtension="webm"
            />
            <div>
                {answers.length > 0 && (
                    <TypingText text={answers.join(" ")} />
                )}
            </div>

            <div>
                {responses.map((responseText, index) => (
                    <TypingText key={index} text={responseText} />
                ))}
            </div>
        </div>
    );
};

export default AudioRecorderComponent;
