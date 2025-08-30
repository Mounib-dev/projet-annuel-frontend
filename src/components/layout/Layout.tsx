import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import BalanceModal from "../balance/BalanceModal";
import FloatingChatbot from "../chatbot/FloatingChatBot";

import { useAuth } from "../../context/AuthContext";
import { useBalance } from "../../context/BalanceContext";
import api from "../../api";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [isBalanceModalOpen, setBalanceModalOpen] = useState<boolean>(true);
  const [hasBalance, setHasBalance] = useState<boolean>(false);

  const { setBalance } = useBalance();

  const handleSaveBalance = (balance: number) => {
    setBalance(balance);
    setBalanceModalOpen(false);
  };

  useEffect(() => {
    const fetchUserBalance = async () => {
      const balanceEndpoint = "/balance";
      const response = await api.get(
        import.meta.env.VITE_API_BASE_URL + balanceEndpoint,
      );
      if (response.status === 200 && response.data.user) {
        return setHasBalance(true);
      }
      return setHasBalance(false);
    };

    if (isLoggedIn) fetchUserBalance();
  }, [isLoggedIn, setBalance]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <NavBar />

      {isLoggedIn && !hasBalance && (
        <BalanceModal open={isBalanceModalOpen} onSave={handleSaveBalance} />
      )}

      <main className="mt-16 flex-1 rounded-md bg-gray-50 shadow-md transition-colors duration-500 dark:bg-gray-900">
        {children}
      </main>

      <Footer />

      {/* Chatbot flottant accessible sur toutes les pages */}

      {isLoggedIn && <FloatingChatbot />}
    </div>
  );
};

export default Layout;
