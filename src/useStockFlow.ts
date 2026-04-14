/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AppData, GitHubConfig, Supply, Product, Purchase, Sale } from './types';
import { toast } from 'sonner';

const API_BASE = 'https://api.github.com';

export function useStockFlow() {
  const [config, setConfig] = useState<GitHubConfig | null>(() => {
    try {
      const saved = localStorage.getItem('stockflow_gh_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem('stockflow_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse data from localStorage', e);
    }
    return {
      supplies: [],
      products: [],
      purchases: [],
      sales: [],
      meta: { storeName: 'Minha Loja', lastSync: null },
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockflow_data', JSON.stringify(data));
  }, [data]);

  const githubRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!config) return null;
    const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 404 && options.method !== 'PUT') return null;
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'GitHub API error');
    }
    return response.json();
  }, [config]);

  const sync = async () => {
    if (!config) return;
    setIsLoading(true);
    try {
      // 1. Try to get existing file to get SHA
      const existingFile = await githubRequest('stockflow_data.json');
      const sha = existingFile?.sha;

      // 2. Prepare content
      const timestamp = new Date().toISOString();
      const dataToSave = { ...data, meta: { ...data.meta, lastSync: timestamp } };
      const jsonString = JSON.stringify(dataToSave, null, 2);
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));

      // 3. Update/Create file
      await githubRequest('stockflow_data.json', {
        method: 'PUT',
        body: JSON.stringify({
          message: `StockFlow Sync: ${timestamp}`,
          content: encoded,
          sha,
        }),
      });

      setData(dataToSave);
      toast.success('Sincronizado com GitHub!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro ao sincronizar com GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromGitHub = async () => {
    if (!config) return;
    setIsLoading(true);
    try {
      const file = await githubRequest('stockflow_data.json');
      if (file) {
        const content = atob(file.content);
        const decoded = JSON.parse(decodeURIComponent(escape(content)));
        setData(decoded);
        toast.success('Dados carregados do GitHub!');
      } else {
        toast.info('Nenhum dado encontrado no GitHub. Criando novo...');
      }
    } catch (error) {
      toast.error('Erro ao carregar do GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config && !data.meta.lastSync) {
      loadFromGitHub();
    }
  }, [config]);

  const saveConfig = (newConfig: GitHubConfig) => {
    localStorage.setItem('stockflow_gh_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado!');
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.supplies && imported.products) {
          setData(imported);
          toast.success('Dados importados!');
        }
      } catch (error) {
        toast.error('Erro ao importar');
      }
    };
    reader.readAsText(file);
  };

  // --- Logic for Supplies ---
  const addSupply = (supply: Omit<Supply, 'id' | 'updatedAt'>) => {
    const newSupply: Supply = {
      ...supply,
      id: `s_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      supplies: [...prev.supplies, newSupply],
    }));
  };

  const updateSupply = (id: string, updates: Partial<Supply>) => {
    setData(prev => {
      const newSupplies = prev.supplies.map(s => 
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      );
      
      // If price changed, we need to recalculate product costs
      let newProducts = prev.products;
      if (updates.currentPrice !== undefined) {
        newProducts = prev.products.map(p => {
          const cost = p.composition.reduce((acc, item) => {
            const supply = newSupplies.find(s => s.id === item.supplyId);
            return acc + (supply ? supply.currentPrice * item.quantity : 0);
          }, 0);
          return { ...p, calculatedCost: cost };
        });
      }

      return { ...prev, supplies: newSupplies, products: newProducts };
    });
  };

  // --- Logic for Purchases ---
  const registerPurchase = (purchase: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `pur_${Date.now()}`,
    };

    setData(prev => {
      const newSupplies = [...prev.supplies];
      
      const totalItemsCost = purchase.items.reduce((acc, item) => acc + item.price, 0);
      const shippingFactor = totalItemsCost > 0 ? (totalItemsCost + purchase.shippingCost) / totalItemsCost : 1;

      // Update supply stocks and prices
      purchase.items.forEach(item => {
        const supplyIdx = newSupplies.findIndex(s => s.id === item.supplyId);
        if (supplyIdx !== -1) {
          const supply = newSupplies[supplyIdx];
          // Proportional price with shipping
          const itemPriceWithShipping = item.price * shippingFactor;
          const unitPrice = itemPriceWithShipping / (item.packageSize * item.quantity);
          
          newSupplies[supplyIdx] = {
            ...supply,
            currentStock: supply.currentStock + (item.packageSize * item.quantity),
            currentPrice: unitPrice, // Update to latest price (including shipping)
            purchasePrice: item.price,
            packageSize: item.packageSize,
            updatedAt: new Date().toISOString(),
          };
        }
      });

      // Recalculate all product costs based on new supply prices
      const newProducts = prev.products.map(p => {
        const cost = p.composition.reduce((acc, compItem) => {
          const supply = newSupplies.find(s => s.id === compItem.supplyId);
          return acc + (supply ? supply.currentPrice * compItem.quantity : 0);
        }, 0);
        return { ...p, calculatedCost: cost };
      });

      return {
        ...prev,
        purchases: [...prev.purchases, newPurchase],
        supplies: newSupplies,
        products: newProducts,
      };
    });
  };

  // --- Logic for Products ---
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'calculatedCost'>) => {
    const cost = product.composition.reduce((acc, item) => {
      const supply = data.supplies.find(s => s.id === item.supplyId);
      return acc + (supply ? supply.currentPrice * item.quantity : 0);
    }, 0);

    const newProduct: Product = {
      ...product,
      id: `p_${Date.now()}`,
      calculatedCost: cost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setData(prev => {
      const newProducts = prev.products.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          // Recalculate cost if composition changed
          if (updates.composition) {
            updated.calculatedCost = updates.composition.reduce((acc, item) => {
              const supply = prev.supplies.find(s => s.id === item.supplyId);
              return acc + (supply ? supply.currentPrice * item.quantity : 0);
            }, 0);
          }
          return updated;
        }
        return p;
      });
      return { ...prev, products: newProducts };
    });
  };

  // --- Logic for Sales ---
  const registerSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: `s_${Date.now()}`,
    };

    setData(prev => {
      const newProducts = [...prev.products];
      
      // Update product stocks
      sale.items.forEach(item => {
        const prodIdx = newProducts.findIndex(p => p.id === item.productId);
        if (prodIdx !== -1) {
          newProducts[prodIdx] = {
            ...newProducts[prodIdx],
            currentStock: Math.max(0, newProducts[prodIdx].currentStock - item.quantity),
            updatedAt: new Date().toISOString(),
          };
        }
      });

      return {
        ...prev,
        sales: [...prev.sales, newSale],
        products: newProducts,
      };
    });
  };

  return {
    config,
    saveConfig,
    data,
    setData,
    isLoading,
    sync,
    exportData,
    importData,
    addSupply,
    updateSupply,
    registerPurchase,
    addProduct,
    updateProduct,
    registerSale,
  };
}
