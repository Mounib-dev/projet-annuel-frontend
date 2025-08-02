// src/context/BalanceContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

interface BalanceContextType {
  balance: number;
  setBalance: (value: number) => void;
  fetchBalance: () => Promise<void>;
}

//const BalanceContext = createContext<BalanceContextType | undefined>(undefined);
export const BalanceContext = createContext<BalanceContextType | undefined>(undefined);


export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const { isLoggedIn } = useAuth();

  const fetchBalance = async () => {
    try {
      const userBalanceEndpoint = "/balance";
      const response = await api.get(
        import.meta.env.VITE_API_BASE_URL + userBalanceEndpoint,
      );
      if (response.status === 200) {
        setBalance(response.data.amount);
      }
    } catch (error) {
      console.error("Error fetching balance", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchBalance();
  }, [isLoggedIn]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
