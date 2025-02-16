import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <footer className="mt-auto bg-gradient-to-r from-green-400 to-green-600 py-4 text-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-700">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Smart Funds. All rights reserved.
          </p>
          <div>
            <a
              href="#"
              className="text-sm transition duration-200 hover:text-gray-400"
            >
              Privacy Policy
            </a>
            <span className="mx-2">|</span>
            <a
              href="#"
              className="text-sm transition duration-200 hover:text-gray-400"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
