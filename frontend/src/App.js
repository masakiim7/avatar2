import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ja-JP';
} else {
  console.error('Speech recognition not supported');
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (recognition) {
      handleListen();
    }
  }, [isListening]);

  const handleListen = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setNote(transcript);
      };
    } else {
      recognition.stop();
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };
  };

  const handleSaveNote = async () => {
    // 前述のコード
  };

  return (
    <div className="App">
      <h1>AI Voice Chat</h1>
      <div>
        <button onClick={() => setIsListening(prevState => !prevState)}>
          {isListening ? '音声入力停止' : '音声入力開始'}
        </button>
        <button onClick={handleSaveNote} disabled={!note || isLoading}>
          {isLoading ? '処理中...' : '送信'}
        </button>
      </div>
      {note && <p>入力: {note}</p>}
      <div>
        <h2>会話履歴:</h2>
        {savedNotes.map((n, index) => (
          <div key={index}>
            <p>あなた: {n.note}</p>
            <p>AI: {n.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;