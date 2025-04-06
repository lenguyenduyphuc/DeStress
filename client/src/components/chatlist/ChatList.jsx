import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../services/chat";
import {
  PlusIcon,
  InfoIcon,
  MessageSquareIcon,
  MessageCircleIcon,
} from "lucide-react";
import "./chatList.css";

const ChatList = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["user"],
    queryFn: () => chatApi.getAllChats(),
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Error deleting chat:", error);
    },
  });

  const handleDeleteChat = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChatMutation.mutate(chatId);
  };

  const getChatTitle = (chat) => {
    if (chat.title) return chat.title;

    if (chat.history && chat.history.length > 0) {
      const firstUserMessage = chat.history.find((msg) => msg.role === "user");
      if (
        firstUserMessage &&
        firstUserMessage.parts &&
        firstUserMessage.parts.length > 0
      ) {
        const text = firstUserMessage.parts[0].text || "";
        return text.length > 20 ? text.substring(0, 20) + "..." : text;
      }
    }

    return "Chat " + (data.indexOf(chat) + 1);
  };

  return (
    <div className="chatList">
      <span className="title">Dashboard</span>
      <Link
        to="/dashboard"
        className={location.pathname === "/dashboard" ? "active" : ""}
      >
        <PlusIcon />
        New Chat
      </Link>
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        <InfoIcon />
        About
      </Link>
      <Link
        to="/contact"
        className={location.pathname === "/contact" ? "active" : ""}
      >
        <MessageCircleIcon />
        Contact
      </Link>
      <hr />
      <span className="title">Recent Chats</span>
      <div className="list">
        {isPending ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">Something went wrong!</div>
        ) : data && data.length > 0 ? (
          data.map((chat) => (
            <div className="chat-item" key={chat.id || chat._id}>
              <Link
                to={`/dashboard/chats/${chat.id || chat._id}`}
                className={
                  location.pathname ===
                  `/dashboard/chats/${chat.id || chat._id}`
                    ? "active"
                    : ""
                }
              >
                <MessageSquareIcon />
                {getChatTitle(chat)}
                <button
                  className="delete-chat"
                  onClick={(e) => handleDeleteChat(e, chat.id || chat._id)}
                >
                  ✖
                </button>
              </Link>
            </div>
          ))
        ) : (
          <div className="empty-list">No chats yet</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
