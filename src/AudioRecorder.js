import React from "react";
import { AudioRecorder } from 'react-audio-voice-recorder';

const uploadAudio = (blob) => {
    const url = URL.createObjectURL(blob);

    // Генерируем уникальное имя файла с использованием временной метки
    const uniqueFilename = `recording_${Date.now()}.webm`;

    // Создаем объект FormData и добавляем туда аудиофайл с именем "file"
    const formData = new FormData();
    formData.append("file", blob, uniqueFilename);

    fetch("http://127.0.0.1:8000/upload-audio", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Сервер ответил:", data);
            if (data.id) {
                monitorProcessedText(data.id); // Запуск мониторинга с полученным id
            }
        })
        .catch((error) => {
            console.error("Ошибка при отправке на сервер:", error);
        });
};

const monitorProcessedText = (id) => {
    fetch(`http://127.0.0.1:8000/get_processed_text/${id}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("Мониторинг: Сервер ответил:", data);
            if (data.question_text) {
                console.log("Вопрос:", data.question_text);
                // Делайте что-то с полученным question_text, например, отображайте его на странице
            } else {
                console.log("Вопрос ещё не готов");
                // Повторный запрос через определенный интервал
                setTimeout(() => monitorProcessedText(id), 1000); // Примерно каждую секунду
            }
        })
        .catch((error) => {
            console.error("Ошибка при мониторинге:", error);
        });
};

const AudioRecorderComponent = () => {
    return (
        <AudioRecorder
            onRecordingComplete={uploadAudio}
            audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
            }}
            downloadOnSavePress={false}
            downloadFileExtension="webm"
        />
    );
};

export default AudioRecorderComponent;
