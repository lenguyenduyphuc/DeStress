"use client";

import "./chatPage.css";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { chatApi } from "../../services/chat";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ChatPage = () => {
  const { id: chatId } = useParams();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const {
    isLoading: isFetching,
    error,
    data,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => chatApi.getChat(chatId),
    enabled: !!chatId,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (text) => chatApi.sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [data]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    sendMessageMutation.mutate(text);
  };

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat" ref={chatContainerRef}>
          {isFetching ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Loading conversation...</span>
            </div>
          ) : error ? (
            <div className="error-message">Error: {error.message}</div>
          ) : (
            data?.history?.map((message, i) => (
              <div
                className={message.role === "user" ? "message user" : "message"}
                key={i}
              >
                {message.parts && message.parts[0] && (
                  <Markdown>{message.parts[0].text}</Markdown>
                )}
              </div>
            ))
          )}
        </div>

        <div className="input-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading || isFetching}
              ref={inputRef}
            />
            <button
              type="submit"
              disabled={isLoading || isFetching || !inputText.trim()}
            >
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
    </div>
  );
};

export default ChatPage;
