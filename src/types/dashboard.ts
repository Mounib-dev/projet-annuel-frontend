import { Transaction } from "./transaction";

export type FilterType = "day" | "week" | "month" | "year";

export interface Totals {
  income: Transaction[];
  expense: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
