"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import "./dashboardPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { chatApi } from "../../services/chat";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch existing chat
  const { data: chatData } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => (id ? chatApi.getChat(id) : null),
    enabled: !!id,
  });

  // Create new chat
  const createChatMutation = useMutation({
    mutationFn: (text) => chatApi.createChat(text),
    onSuccess: (chatId) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate(`/dashboard/chats/${chatId}`);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      setIsLoading(false);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, text }) => chatApi.sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
      setInputText("");
      setIsLoading(false);
      // Focus the input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsLoading(false);
    },
  });

  // Update messages when chat data changes
  useEffect(() => {
    if (chatData?.history) {
      setMessages(chatData.history);
    }
  }, [chatData]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    setIsLoading(true);

    // Optimistic UI update
    setMessages((prev) => [...prev, { role: "user", parts: [{ text }] }]);

    if (id) {
      sendMessageMutation.mutate({ chatId: id, text });
    } else {
      createChatMutation.mutate(text);
    }
  };

  return (
    <div className="dashboardPage">
      <div className="chatContainer" ref={chatContainerRef}>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "userMessage" : "modelMessage"
              }`}
            >
              <div className="messageContent">
                {message.parts?.map((part, idx) => (
                  <div key={idx}>{part.text}</div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="emptyChat">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8"></path>
              <path d="M12 8v8"></path>
            </svg>
            <h2>Start a new conversation</h2>
            <p>
              Ask me anything to help you relax, focus, or be more productive
            </p>
          </div>
        )}
        {isLoading && (
          <div className="message modelMessage">
            <div className="messageContent">Thinking...</div>
          </div>
        )}
      </div>

      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            ref={inputRef}
          />
          <button type="submit" disabled={isLoading || !inputText.trim()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
