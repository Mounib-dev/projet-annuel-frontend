import { useState, useEffect } from "react";
import { ChatMessage } from "../types/chat";

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("chatbot-messages");
    return saved ? JSON.parse(saved) : [];
  });

  // Recharge quand le composant se remonte (navigation SPA)
  useEffect(() => {
    const saved = localStorage.getItem("chatbot-messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Sauvegarde dans localStorage à chaque update
  useEffect(() => {
    localStorage.setItem("chatbot-messages", JSON.stringify(messages));
  }, [messages]);

  // Synchronisation entre onglets (et éventuellement futurs composants)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "chatbot-messages" && event.newValue) {
        setMessages(JSON.parse(event.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return [messages, setMessages] as const;
}
