import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { KeyRound, LogOut } from "lucide-react";

import ThemeToggle from "./ThemeToggle";
import api from "../../api";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const fetchUserBalance = async () => {
      const userBalanceEndpoint = "/balance";
      const response = await api.get(
        import.meta.env.VITE_API_BASE_URL + userBalanceEndpoint,
      );
      console.log(response.data);
      if (response.status === 200) {
        setUserBalance(response.data.amount);
      }
    };
    if (isLoggedIn) {
      fetchUserBalance();
    }
  }, [isLoggedIn]);

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-green-400 to-green-600 p-4 text-white dark:from-gray-900 dark:to-gray-700">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-2xl font-bold">SmartFunds</h1>
          {isLoggedIn && (
            <h2 className="rounded-2xl border px-4 py-2 text-xl font-bold text-green-500">
              {userBalance} €
            </h2>
          )}

          {/* Hamburger Menu (Mobile) */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Navigation Links (Mobile & Desktop) */}
          <ul
            className={`absolute top-16 left-0 w-full md:static md:w-auto ${
              isOpen
                ? "bg-gradient-to-r from-green-400 to-green-600 shadow-md dark:from-gray-900 dark:to-gray-700"
                : "hidden"
            } p-4 text-lg transition-all duration-300 md:flex md:space-x-6 md:bg-transparent md:p-0`}
          >
            {isLoggedIn === false ? (
              <li className="py-2 md:py-0">
                <Link to="/login" className="block hover:underline">
                  <KeyRound />
                </Link>
              </li>
            ) : (
              <>
                <li className="py-2 md:py-0">
                  <Link to="/" className="block hover:underline">
                    Home
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/transaction" className="block hover:underline">
                    Transactions
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/graph" className="block hover:underline">
                    Statistiques
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/ai-assistant" className="block hover:underline">
                    Assistance
                  </Link>
                </li>

                <li className="py-2 md:py-0">
                  <Link to="/profile" className="block hover:underline">
                    {user}
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <LogOut className="hover:text-green-500" onClick={logout} />
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <ThemeToggle />
    </>
  );
}

export default NavBar;
