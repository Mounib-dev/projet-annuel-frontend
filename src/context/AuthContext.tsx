/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  token: string | null;
  user: any;
  isLoggedIn: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<any | null>(
    () => localStorage.getItem("user") || null,
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem("isLoggedIn") === "true",
  );
  const navigate = useNavigate();

  // Token expiration
  const getTokenExpirationDate = (token: string): Date | null => {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return null;
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decoded.exp);
      return expirationDate;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Check token expiration
  const isTokenExpired = (token: string): boolean => {
    const expirationDate = getTokenExpirationDate(token);
    return expirationDate ? expirationDate.getTime() <= Date.now() : false;
  };

  // Check Token
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      console.log("Token expired, logging out.");
      logout();
    } else {
      setIsLoggedIn(!!token);
    }

    const intervalId = setInterval(() => {
      if (token && isTokenExpired(token)) {
        console.log("Token expired, logging out (from interval).");
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [token]);

  // Login
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        credentials,
      );
      console.log(response);

      if (response.status === 201 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");

        const user = jwtDecode(response.data.token);
        console.log(user);
        const userInfoEndpoint = "user/user-info";
        const userInfo = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/${userInfoEndpoint}`,
          {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          },
        );
        console.log(userInfo);
        setUser(userInfo.data.user.firstname);
        localStorage.setItem("user", userInfo.data.user.firstname);
        navigate("/transaction");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("chatbot-messages");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [token]);

  const value: AuthContextType = { token, user, isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
