import { AppUser, Expense, MenuItem, Sale } from "./types";

export const users: AppUser[] = [
  {
    id: "u1",
    name: "Ahmet Yildiz",
    role: "admin",
    email: "admin@restaurant.local",
    authUserId: null,
  },
  {
    id: "u2",
    name: "Zeynep Kaya",
    role: "manager",
    email: "manager@restaurant.local",
    authUserId: null,
  },
  {
    id: "u3",
    name: "Can Demir",
    role: "staff",
    email: "staff@restaurant.local",
    authUserId: null,
  },
];

export const menuItemsSeed: MenuItem[] = [
  { id: "m1", name: "Doner Porsiyon", category: "Ana Yemek", price: 180, active: true },
  { id: "m2", name: "Pilav Ustu Tavuk", category: "Ana Yemek", price: 160, active: true },
  { id: "m3", name: "Ayran", category: "Icecek", price: 30, active: true },
  { id: "m4", name: "Kola", category: "Icecek", price: 45, active: true },
  { id: "m5", name: "Kunefe", category: "Tatli", price: 95, active: true },
];

export const salesSeed: Sale[] = [
  {
    id: "s1",
    createdAt: new Date().toISOString(),
    createdBy: "Ahmet Yildiz",
    totalAmount: 390,
    items: [
      { menuItemId: "m1", name: "Doner Porsiyon", qty: 2, unitPrice: 180, lineTotal: 360 },
      { menuItemId: "m3", name: "Ayran", qty: 1, unitPrice: 30, lineTotal: 30 },
    ],
  },
];

export const expensesSeed: Expense[] = [
  {
    id: "e1",
    title: "Tavuk Alimi",
    supplier: "Toptanci A",
    amount: 3200,
    expenseDate: new Date().toISOString().slice(0, 10),
    note: "Haftalik alis",
  },
  {
    id: "e2",
    title: "Icecek Alimi",
    supplier: "Toptanci B",
    amount: 1450,
    expenseDate: new Date().toISOString().slice(0, 10),
  },
];
