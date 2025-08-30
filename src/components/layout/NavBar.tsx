import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { KeyRound, LogOut } from "lucide-react";

import ThemeToggle from "./ThemeToggle";

import { useBalance } from "../../context/BalanceContext";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const { balance } = useBalance();

  const { isLoggedIn, user, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-emerald-400 to-emerald-600 p-4 text-white dark:from-gray-900 dark:to-gray-700">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-2xl font-bold">SmartFunds</h1>
          {isLoggedIn && (
            <h2 className="rounded-2xl border px-4 py-2 text-xl font-bold text-white dark:text-emerald-600">
              {balance} €
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
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-md dark:from-gray-900 dark:to-gray-700"
                : "hidden"
            } p-4 text-lg transition-all duration-300 md:flex md:space-x-6 md:bg-transparent md:p-0`}
          >
            {isLoggedIn === false ? (
              <li className="py-2 md:py-0">
                <Link
                  to="/login"
                  className="block hover:text-emerald-300 dark:hover:text-emerald-600"
                >
                  <KeyRound />
                </Link>
              </li>
            ) : (
              <>
                <li className="py-2 md:py-0">
                  <Link
                    to="/"
                    className={`block hover:text-emerald-300 dark:hover:text-emerald-600 ${location.pathname === "/" ? "text-emerald-300 dark:text-emerald-600" : ""}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link
                    to="/transaction"
                    className={`block hover:text-emerald-300 dark:hover:text-emerald-600 ${location.pathname === "/transaction" ? "text-emerald-300 dark:text-emerald-600" : ""}`}
                  >
                    Transactions
                  </Link>
                </li>

                <li className="py-2 md:py-0">
                  <Link
                    to="/goal"
                    className={`block hover:text-emerald-300 dark:hover:text-emerald-600 ${location.pathname === "/goal" ? "text-emerald-300 dark:text-emerald-600" : ""}`}
                  >
                    Goals
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link
                    to="/ai-assistant"
                    className={`block hover:text-emerald-300 dark:hover:text-emerald-600 ${location.pathname === "/ai-assistant" ? "text-emerald-300 dark:text-emerald-600" : ""}`}
                  >
                    Assistance
                  </Link>
                </li>

                <li className="py-2 md:py-0">
                  <Link
                    to="/profile"
                    className={`block hover:text-emerald-300 dark:hover:text-emerald-600 ${location.pathname === "/profile" ? "text-emerald-300 dark:text-emerald-600" : ""}`}
                  >
                    {user}
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <LogOut className="hover:text-emerald-500" onClick={logout} />
                </li>
                <li className="py-2 md:py-0">
                  <ThemeToggle />
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
