import React, { useEffect, useState } from "react";
import { Mail, ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
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
    console.log("Déconnexion...");
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f172a]">

        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Chargement...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f172a]">

        <p className="text-red-500">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] px-4 py-10">

  <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl transition-all duration-300">
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
        <UserCircle2 className="h-20 w-20 text-green-600 dark:text-green-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {profile.firstname} {profile.lastname}
      </h2>
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm text-green-700 dark:bg-green-800 dark:text-green-200">
        <ShieldCheck size={16} />
        <span className="capitalize">{profile.role}</span>
      </div>

      <div className="w-full text-left space-y-4 mt-6">
        <div className="flex items-center gap-3">
          <Mail className="text-green-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {profile.email}
          </span>
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2 text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </div>
  </div>
</div>

  );
};

export default Profile;
