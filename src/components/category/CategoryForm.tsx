import { useState } from "react";
import { Martini, CreditCard, HomeIcon, ShoppingCart, GiftIcon} from "lucide-react";
import api from "../../api";

interface CategoryFormProps {
  onAddCategory: (newCategory: { id: string; title: string; icon: React.ReactNode }) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  "martini": <Martini />,
  "credit-card": <CreditCard />,
  "homeIcon": <HomeIcon />,
  "shopping-cart": <ShoppingCart />,
  "GiftIcon": <GiftIcon />,
};

const CategoryForm = ({ onAddCategory }: CategoryFormProps) => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Catégorie envoyée :", { title, icon });

    try {
      const response = await api.post("/category/create", {
        title,
        icon,
      });

      if (response.status === 201) {
        const newCategory = response.data;

        const iconComponent = iconMap[icon] || null;

        onAddCategory({
          id: newCategory._id || newCategory.id,
          title: newCategory.title,
          icon: iconComponent,
        });

        setTitle("");
        setIcon("");
       setSuccessMessage("Catégorie ajoutée avec succès !");
       setTimeout(() => setSuccessMessage(""), 3000);

      }
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      alert("Erreur lors de la création de la catégorie.");
    }
  };

  return (
    <form method="POST" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <label htmlFor="categoryTitle" className="block dark:text-gray-300">
          Titre
        </label>
        <input
          type="text"
          name="categoryTitle"
          id="categoryTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border bg-gray-700 px-4 py-2 focus:ring focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="mt-4 space-y-2 text-center">
        <label className="block dark:text-gray-300">Icône</label>
        <div className="flex items-center justify-center space-x-3">
          {/* Martini icon radio */}
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="radio"
              name="categoryIcon"
              value="martini"
              checked={icon === "martini"}
              onChange={() => setIcon("martini")}
              className="peer hidden"
            />
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
            <span className="text-gray-700 peer-checked:text-green-600">
              <Martini />
            </span>
          </label>

          {/* Credit Card icon radio */}
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="radio"
              name="categoryIcon"
              value="credit-card"
              checked={icon === "credit-card"}
              onChange={() => setIcon("credit-card")}
              className="peer hidden"
            />
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
            <span className="text-gray-700 peer-checked:text-green-600">
              <CreditCard />
            </span>
          </label>
             {/* Home icon radio */}
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="radio"
              name="categoryIcon"
              value="HomeIcon"
              checked={icon === "HomeIcon"}
              onChange={() => setIcon("HomeIcon")}
              className="peer hidden"
            />
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
            <span className="text-gray-700 peer-checked:text-green-600">
              <HomeIcon />
            </span>
          </label>
             {/* shopping Card icon radio */}
             <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="radio"
              name="categoryIcon"
              value="shopping-cart"
              checked={icon === "shopping-cart"}
              onChange={() => setIcon("shopping-cart")}
              className="peer hidden"
            />
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
            <span className="text-gray-700 peer-checked:text-green-600">
              <ShoppingCart />
            </span>
          </label>

             {/* gift icon radio */}
             <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="radio"
              name="categoryIcon"
              value="GiftIcon"
              checked={icon === "GiftIcon"}
              onChange={() => setIcon("GiftIcon")}
              className="peer hidden"
            />
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
            <span className="text-gray-700 peer-checked:text-green-600">
              <GiftIcon />
            </span>
          </label>
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="mt-8 mb-2 rounded-md border-none bg-green-600 px-2 py-1 text-white transition-colors hover:bg-green-700"
        >
          Ajouter
        </button>

      </div>
      {successMessage && (
  <div className="mt-4 text-green-500 text-center font-semibold transition-opacity duration-300">
    {successMessage}
  </div>
)}

    </form>
  );
};

export default CategoryForm;
