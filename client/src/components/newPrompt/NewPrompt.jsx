import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../services/chat";

const NewPrompt = ({ chatId, data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [question, answer]);

  const messageMutation = useMutation({
    mutationFn: (text) => chatApi.sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      formRef.current.reset();
      setIsLoading(false);
      inputRef.current.focus();
    },
    onError: (err) => {
      console.error("Error sending message:", err);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;

    setQuestion(text);
    setIsLoading(true);
    messageMutation.mutate(text);
  };

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      const initialMessage = data.history[0].parts[0].text;
      setQuestion(initialMessage);
    }
    hasRun.current = true;
  }, [data]);

  return (
    <div className="newPrompt">
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      {isLoading && <div className="message loading">Thinking</div>}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          name="text"
          placeholder="Ask anything..."
          disabled={isLoading}
          ref={inputRef}
        />
        <button disabled={isLoading}>
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
  );
};

export default NewPrompt;
