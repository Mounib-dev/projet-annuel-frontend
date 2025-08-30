import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const registerEndpoint = "user/register";
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${registerEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setFeedbackMessage(
          "Inscription réussie ! vous pouvez à présent vous connecter",
        );
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        alert("Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-emerald-400 to-emerald-600 p-4 dark:from-gray-900 dark:to-gray-700">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
          Inscription à SmartFunds
        </h2>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {feedbackMessage && (
            <p className="text-center text-emerald-500 transition">
              {feedbackMessage}
            </p>
          )}
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Prénom
            </label>
            <input
              type="text"
              name="firstname"
              placeholder="Votre prénom"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nom
            </label>
            <input
              type="text"
              name="lastname"
              placeholder="Votre nom"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Email */}
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
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              placeholder="Créer un mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-white transition duration-300 hover:bg-emerald-600"
          >
            S'inscrire
          </button>
        </form>

        {/* Login Redirect */}
        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Déjà inscrit ?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
