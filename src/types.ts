/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Unit = 'ml' | 'g' | 'un' | 'kg' | 'L';

export interface Supply {
  id: string;
  name: string;
  unit: Unit;
  currentPrice: number; // Price per unit (e.g., price per 1ml)
  purchasePrice: number; // Last purchase price for the full package
  packageSize: number; // Size of the package bought (e.g., 50 for 50ml)
  currentStock: number;
  category?: string;
  updatedAt: string;
}

export interface CompositionItem {
  supplyId: string;
  quantity: number; // Quantity used in the final product
}

export interface Product {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  composition: CompositionItem[];
  calculatedCost: number;
  currentStock: number;
  minStock: number;
  sku?: string;
  description?: string;
  image?: string;
  updatedAt: string;
  createdAt: string;
}

export interface PurchaseItem {
  supplyId: string;
  quantity: number; // Quantity of packages
  packageSize: number; // Size of each package
  price: number; // Price per package
}

export interface Purchase {
  id: string;
  date: string;
  items: PurchaseItem[];
  totalCost: number;
  shippingCost: number;
  paymentMethod: 'money' | 'pix' | 'debit' | 'credit' | 'transfer';
  installments?: number; // Number of installments if credit
  notes?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export interface AppData {
  supplies: Supply[];
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  meta: {
    storeName: string;
    lastSync: string | null;
  };
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}
