import React, { useState } from 'react';
import axios from 'axios';

const ChatComponent = () => {
  const [inputChat, setInputChat] = useState("");
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setInputChat(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessage = { id: Date.now(), role: 'user', content: inputChat };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await axios.post("http://localhost:8081/api/chat", { inputChat });
    //   console.log(response);
      const assistantMessage = {
        id: Date.now() + 1, 
        role: 'assistant',
        content: response.data.message,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    //   console.log(messages);
    } catch (error) {
      console.error("Error fetching response:", error);
    }

    setInputChat("");
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <h3 className="text-lg font-semibold mt-2">
              {message.role === 'assistant' ? 'GPT-4' : 'User'}
            </h3>

            {message.content?.split("\n").map((line, index) => (
              <p key={`${message.id}-${index}`}>
                {line || <>&nbsp;</>}
              </p>
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-12">
        <p>User Message</p>
        <textarea  className="mt-2 w-full bg-slate-600 text-white p-2 rounded-md"  placeholder="Enter Your Prompt here...."  value={inputChat}  onChange={handleInputChange}  name="chat"  id="chat"/>
        <button type="submit" className="rounded-md bg-blue-600 p-2 mt-2 text-white"> Send message </button>
      </form>
    </div>
  );
};

export default ChatComponent;
