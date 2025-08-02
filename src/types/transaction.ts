export type TransactionType = "income" | "expense";

export interface Transaction {
  _id: string;
  user: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
