import React, { useState } from 'react';
import axios from 'axios';

export default function Chat() {
  const [messages, setMessages] = useState([{ sender: 'agent', text: 'Hello! I am your Health Concierge. How can I help you today?' }]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post('http://localhost:8080/api/chat', { message: input });
      setMessages([...newMessages, { sender: 'agent', text: response.data.response }]);
    } catch (e) {
      setMessages([...newMessages, { sender: 'agent', text: 'Sorry, I am having trouble connecting to the server.' }]);
    }
  };

  return (
    <div>
      <h1 className="page-title">Concierge Chat</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={"message " + msg.sender}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
