import React, { useEffect, useState } from "react";
import { Mail, ShieldCheck, LogOut } from "lucide-react";
import api from "../../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/user-info");
        console.log("Profil chargé :", response.data);
        setProfile(response.data.user);
      } catch (error) {
        console.error(
          "Erreur lors du chargement du profil :",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logout = () => {
    // Remplace ceci par ta logique de déconnexion
    console.log("Déconnexion...");
    localStorage.clear(); // ou remove token
    window.location.href = "/login"; // redirection vers page login
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-300 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all duration-300">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-white">
          Mon Profil
        </h2>
        <div className="space-y-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Prénom
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {profile.firstname}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Nom
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {profile.lastname}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail size={16} className="text-green-500" />
            <p className="text-md text-gray-700 dark:text-gray-300">
              {profile.email}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-green-700 dark:bg-green-800 dark:text-green-200">
            <ShieldCheck size={16} />
            <span className="text-sm capitalize">{profile.role}</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
