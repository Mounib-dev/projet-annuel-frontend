import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const { token } = useAuth();

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/chatbot/assistant",
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
        console.error("No response body received.");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { role: "assistant", content: "" };

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
                setMessages(() => [...newMessages, { ...botMessage }]);
              } catch (err) {
                console.error("JSON parse error:", err);
              }
            }
          });
        }
      };

      await readStream();
    } catch (error) {
      console.error("Request error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold text-green-400">
          💰 Finance Chatbot
        </h2>
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto rounded-md border border-gray-700 bg-gray-700 p-4"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`my-2 max-w-xs rounded-lg p-3 text-sm sm:max-w-sm ${
                msg.role === "user"
                  ? "ml-auto bg-green-500 text-right text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about finance..."
            className="flex-1 rounded-md border border-gray-600 bg-gray-700 p-3 text-white focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 rounded-md bg-green-500 px-4 py-3 text-white transition hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
