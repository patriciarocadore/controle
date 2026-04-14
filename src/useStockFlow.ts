/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppData, GitHubConfig, Supply, Product, Purchase, Sale, PurchaseItem } from './types';
import { GitHubService } from './lib/githubService';
import { toast } from 'sonner';

export function useStockFlow() {
  const [config, setConfig] = useState<GitHubConfig | null>(() => {
    try {
      const saved = localStorage.getItem('stockflow_gh_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse config from localStorage', e);
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

  const githubService = useMemo(() => (config ? new GitHubService(config) : null), [config]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado com sucesso!');
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        // Basic validation
        if (imported.supplies && imported.products) {
          setData(imported);
          toast.success('Dados importados com sucesso!');
        } else {
          toast.error('Arquivo de backup inválido.');
        }
      } catch (error) {
        toast.error('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const loadData = useCallback(async () => {
    if (!githubService) return;
    setIsLoading(true);
    try {
      const loadedData = await githubService.loadAllData();
      setData(loadedData);
    } catch (error) {
      toast.error('Erro ao carregar dados do GitHub');
    } finally {
      setIsLoading(false);
    }
  }, [githubService]);

  useEffect(() => {
    if (config) {
      loadData();
    }
  }, [config, loadData]);

  const saveConfig = (newConfig: GitHubConfig) => {
    localStorage.setItem('stockflow_gh_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const sync = async () => {
    if (!githubService) return;
    setIsLoading(true);
    try {
      const savedData = await githubService.saveAllData(data);
      setData(savedData);
      toast.success('Sincronizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao sincronizar');
    } finally {
      setIsLoading(false);
    }
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
