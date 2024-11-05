import React, { useState } from 'react';
import axios from 'axios';

const PdfComponent = () => {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a PDF file.");
      return;
    }

    const newMessage = { id: Date.now(), role: 'user', content: `Uploaded PDF: ${file.name}` };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true); // Start loading

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8081/api/pdfanalyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const assistantMessage = {
        id: Date.now() + 1, 
        role: 'assistant',
        content: response.data.message,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "An error occurred while processing the PDF.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setFile(null); 
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
        <p>Upload PDF</p>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="mt-2 w-full bg-slate-600 text-white p-2 rounded-md" 
        />
        <button type="submit" className="rounded-md bg-blue-600 p-2 mt-2 text-white" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Send PDF'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4">
          <p>Loading...</p>
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default PdfComponent;
