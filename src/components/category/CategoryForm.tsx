import { Martini, CreditCard } from "lucide-react";

interface CategoryFormProps {
  sendIconToTransactionForm(data: string): void;
}

const CategoryForm = ({ sendIconToTransactionForm }: CategoryFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <>
      <form method="POST" onSubmit={handleSubmit}>
        <div className="space-y-2 text-center">
          <label htmlFor="categoryTitle" className="block dark:text-gray-300">
            Titre
          </label>
          <input
            type="text"
            name="categoryTitle"
            id="categoryTitle"
            className="rounded-md border bg-gray-700 px-4 py-2 focus:ring focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="mt-4 space-y-2 text-center">
          <label htmlFor="" className="block dark:text-gray-300">
            Icône
          </label>

          <div className="flex items-center justify-center space-x-3">
            <label
              htmlFor="categoryIconMartini"
              className="flex cursor-pointer items-center space-x-2"
            >
              <input
                type="radio"
                name="categoryIcon"
                id="categoryIconMartini"
                value="martini"
                className="peer hidden"
              />
              <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
              <span className="text-gray-700 peer-checked:text-green-600">
                <Martini />
              </span>
            </label>

            <label
              htmlFor="categoryIconCreditCard"
              className="flex cursor-pointer items-center space-x-2"
            >
              <input
                type="radio"
                name="categoryIcon"
                id="categoryIconCreditCard"
                value="martini"
                className="peer hidden"
              />
              <div className="h-5 w-5 rounded-full border-2 border-gray-400 transition peer-checked:border-green-500 peer-checked:bg-green-500"></div>
              <span className="text-gray-700 peer-checked:text-green-600">
                <CreditCard />
              </span>
            </label>
          </div>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="mt-8 mb-2 rounded-md border-none bg-green-600 px-2 py-1 text-white transition-colors hover:bg-green-700"
            onClick={() => sendIconToTransactionForm("Test")}
          >
            Ajouter
          </button>
        </div>
      </form>
    </>
  );
};

export default CategoryForm;
