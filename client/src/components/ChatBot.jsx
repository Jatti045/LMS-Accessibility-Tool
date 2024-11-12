import React, { useState } from "react";
import { XIcon } from "lucide-react";

const chatApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: input },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${chatApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: input }],
          }),
        }
      );

      const data = await response.json();
      const botMessage = data.choices[0].message.content;

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <div
          className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center cursor-pointer"
          onClick={toggleChatBot}
        >
          💬
        </div>
      )}

      {isOpen && (
        <div className="w-80 h-96 bg-white border border-teal-300 rounded-lg shadow-lg flex flex-col mt-3">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 rounded-t-lg">
            <h3 className="text-lg font-semibold">AccessBuddy</h3>
            <button className="text-white" onClick={toggleChatBot}>
              <XIcon />
            </button>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-teal-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${
                  message.sender === "user"
                    ? "bg-teal-500 text-white self-end"
                    : "bg-gray-200 text-gray-800 self-start"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="p-2 bg-gray-200 text-gray-800 rounded-md self-start">
                Typing...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-teal-300 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 border border-teal-300 rounded-lg text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
