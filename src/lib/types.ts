export type UserRole = "admin" | "manager" | "staff";

export type PermissionKey =
  | "dashboard_view"
  | "sales_manage"
  | "transactions_view"
  | "expenses_manage"
  | "menu_manage"
  | "settings_manage"
  | "users_manage"
  | "permissions_manage"
  | "audit_view";

export const ALL_PERMISSIONS: PermissionKey[] = [
  "dashboard_view",
  "sales_manage",
  "transactions_view",
  "expenses_manage",
  "menu_manage",
  "settings_manage",
  "users_manage",
  "permissions_manage",
  "audit_view",
];

export const ROLE_PERMISSION_DEFAULTS: Record<UserRole, PermissionKey[]> = {
  admin: ALL_PERMISSIONS,
  manager: [
    "dashboard_view",
    "sales_manage",
    "transactions_view",
    "expenses_manage",
    "menu_manage",
    "settings_manage",
    "audit_view",
  ],
  staff: ["dashboard_view", "sales_manage", "transactions_view", "expenses_manage"],
};

export type RolePermissionConfig = {
  admin: PermissionKey[];
  manager: PermissionKey[];
  staff: PermissionKey[];
};

export type TabType = "dashboard" | "sales" | "transactions" | "expenses" | "menu" | "audit" | "settings";

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
  permissions?: PermissionKey[] | null;
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

export type AuditLog = {
  id: number;
  eventType: "record_created" | "record_updated" | "record_deleted" | "role_changed";
  tableName: string;
  recordId: string;
  changedByRole: string | null;
  changedAt: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  actorName: string;
};
