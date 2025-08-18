import { useEffect, useState } from "react";
import { Mail, ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

type UserProfile = {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<{ user: UserProfile }>(
          "/user/user-info",
        );
        setProfile(response.data.user);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Erreur lors du chargement du profil :", error.message);
        } else {
          console.error("Erreur inconnue :", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f172a]">
        <p className="animate-pulse text-gray-500 dark:text-gray-400">
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 dark:bg-[#0f172a]">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
            <UserCircle2 className="h-20 w-20 text-emerald-600 dark:text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {profile.firstname} {profile.lastname}
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">
            <ShieldCheck size={16} />
            <span className="capitalize">{profile.role}</span>
          </div>

          <div className="mt-6 w-full space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Mail className="text-emerald-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {profile.email}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-200 px-6 py-2 text-red-800 ring-1 shadow-sm ring-red-300 transition ring-inset hover:bg-red-300 focus:ring-2 focus:ring-red-400 focus:outline-none dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700 dark:hover:bg-red-900/60 dark:focus:ring-red-600"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
