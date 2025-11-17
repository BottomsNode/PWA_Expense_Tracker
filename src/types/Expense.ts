export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  time: string;
  description?: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deleted?: boolean;
  hash?: string;
  tags?: string[];
  confidence?: number;
  source?: "manual" | "notification";
}
