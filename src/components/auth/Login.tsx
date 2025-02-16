import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Connexion réussie !", data);
        localStorage.setItem("token", data.token);
      } else {
        alert("Erreur lors de la connexion.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-green-400 to-green-600 p-4 dark:from-gray-900 dark:to-gray-700">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
          Connexion à SmartFunds
        </h2>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-500 py-2 font-semibold text-white transition duration-300 hover:bg-green-600"
          >
            Se connecter
          </button>
        </form>

        {/* Sign Up Redirect */}
        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Pas encore inscrit ?{" "}
          <Link
            to="/register"
            className="font-semibold text-green-700 hover:underline dark:text-green-400"
          >
            Inscription
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
