export type UserRole = "admin" | "manager" | "staff";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  authUserId?: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
};

export type SaleItem = {
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Sale = {
  id: string;
  createdAt: string;
  createdBy: string;
  totalAmount: number;
  items: SaleItem[];
};

export type Expense = {
  id: string;
  title: string;
  supplier: string;
  amount: number;
  expenseDate: string;
  note?: string;
};
