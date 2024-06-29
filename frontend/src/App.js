import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const result = await axios.post('/api/chat', { message: input });
      setResponse(result.data.text);

      // 音声の再生
      const audio = new Audio(result.data.audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error:', error);
      setResponse('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="App">
      <h1>まさきのへや</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '処理中...' : '送信'}
        </button>
      </form>
      {response && (
        <div className="response">
          <h2>応答:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
