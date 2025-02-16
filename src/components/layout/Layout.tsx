import React, { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavBar />
      <div
        className={`flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900`}
      >
        <main className="flex-1 rounded-md bg-white shadow-md dark:bg-gray-800">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
