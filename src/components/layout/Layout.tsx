import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import BalanceModal from "../balance/BalanceModal";
import FloatingChatbot from "../chatbot/FloatingChatBot";

import { useAuth } from "../../context/AuthContext";
import api from "../../api";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [isBalanceModalOpen, setBalanceModalOpen] = useState<boolean>(true);
  const [hasBalance, setHasBalance] = useState<boolean>(false);

  const handleSaveBalance = (balance: number) => {
    console.log("Balance saved:", balance);
    setBalanceModalOpen(false);
  };

  useEffect(() => {
    const fetchUserBalance = async () => {
      const balanceEndpoint = "/balance";
      const response = await api.get(
        import.meta.env.VITE_API_BASE_URL + balanceEndpoint,
      );
      if (response.status === 200 && response.data.amount) {
        return setHasBalance(false);
      }
      return setHasBalance(true);
    };

    fetchUserBalance();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <NavBar />

      {isLoggedIn && hasBalance && (
        <BalanceModal open={isBalanceModalOpen} onSave={handleSaveBalance} />
      )}

      <main className="mt-16 flex-1 rounded-md bg-white shadow-md dark:bg-gray-800">
        {children}
      </main>

      <Footer />

      {/* Chatbot flottant accessible sur toutes les pages */}

      {isLoggedIn && <FloatingChatbot />}
    </div>
  );
};

export default Layout;
