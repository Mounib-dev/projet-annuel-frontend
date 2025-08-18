import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bot, DollarSign, MessageCircle, X, ExternalLink } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useChatMessages } from "../../hooks/useChatMessages";
import { ChatMessage } from "../../types/chat";

function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useChatMessages();
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { token } = useAuth();

  // Scroll automatique quand il y a un nouveau message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Scroll automatique quand on ouvre la fenêtre
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isOpen]);

  // Fermer le chatbot et recharger la conversation si on change de route
  useEffect(() => {
    setIsOpen(false); // Ferme le chatbot à chaque navigation

    // Recharge la conversation depuis localStorage (synchro immédiate)
    const saved = localStorage.getItem("chatbot-messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [location.pathname, setMessages]); // Se déclenche à chaque changement d'URL

  // Masquer le bouton et la fenêtre si on est sur /ai-assistant
  if (location.pathname === "/ai-assistant") return null;

  // Position dynamique
  const buttonPosition =
    location.pathname === "/goal" ? "bottom-25" : "bottom-6";

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
        console.error("No response body received.");
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
    <>
      {/* ✅ Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${buttonPosition} right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* ✅ Fenêtre du chatbot */}
      {isOpen && (
        <div className="fixed right-6 bottom-20 z-50 flex max-h-[500px] w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-500 px-4 py-3 text-white dark:bg-emerald-600">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">Finance Chatbot</span>
              <DollarSign size={18} />
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/ai-assistant"
                className="transition hover:opacity-80"
                title="Aller sur la page de l'assistant"
                onClick={() => setIsOpen(false)}
              >
                <ExternalLink size={18} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-gray-100 p-4 dark:bg-gray-700"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`my-2 max-w-[80%] rounded-lg p-2 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-emerald-500 text-white dark:bg-emerald-600"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about finance..."
              className="flex-1 rounded-md border border-gray-300 bg-white p-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default FloatingChatBot;
