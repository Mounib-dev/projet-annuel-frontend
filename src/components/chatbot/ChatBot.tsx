import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bot, DollarSign } from "lucide-react";
import { useChatMessages } from "../../hooks/useChatMessages";
import { ChatMessage } from "../../types/chat";

function ChatBot() {
  const [messages, setMessages] = useChatMessages();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chatbot/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        },
      );

      if (!response.body) {
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const botMessage: ChatMessage = { role: "assistant", content: "" };

      const readStream = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          text.split("\n").forEach((line) => {
            if (line.startsWith("data:")) {
              try {
                const json = JSON.parse(line.replace("data: ", ""));
                botMessage.content += json.text;
                setMessages([...newMessages, { ...botMessage }]);
              } catch (err) {
                console.error("JSON parse error:", err);
              }
            }
          });
        }
      };

      await readStream();
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white dark:bg-green-400">
            <Bot size={24} />
          </div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
            Finance Chatbot
          </h2>
          <DollarSign
            className="text-green-500 dark:text-green-400"
            size={24}
          />
        </div>
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto rounded-md border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-700"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`my-2 max-w-xs rounded-lg p-3 text-sm sm:max-w-sm ${
                msg.role === "user"
                  ? "ml-auto bg-green-500 text-right text-white dark:bg-green-600"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about finance..."
            className="flex-1 rounded-md border border-gray-300 bg-gray-100 p-3 text-gray-800 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-md bg-green-500 px-4 py-3 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
