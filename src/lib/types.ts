export type UserRole = "admin" | "manager" | "staff";

export type TabType = "dashboard" | "sales" | "transactions" | "expenses" | "menu" | "settings";

export type RestaurantSettings = {
  restaurantName: string;
  currency: string;
  timezone: string;
  taxRate: string;
};

export type ToastType = "error" | "warning" | "success";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  title: string;
};

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
  receiptNo: string;
  createdAt: string;
  createdBy: string;
  totalAmount: number;
  items: SaleItem[];
};

export type Expense = {
  id: string;
  receiptNo: string;
  title: string;
  supplier: string;
  amount: number;
  expenseDate: string;
  note?: string;
};
