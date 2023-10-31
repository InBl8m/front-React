import React from 'react';
import AudioRecorder from './AudioRecorder';

function App() {
    return (
        <div className="App">
            <h1>Запись и отправка аудио</h1>
            <AudioRecorder />
            <AudioProcessingPage /> {/* Включение компонента AudioProcessingPage в корневой компонент */}
        </div>
    );
}

export default App;
