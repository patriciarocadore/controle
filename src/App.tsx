/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useStockFlow } from './useStockFlow';
import { 
  LayoutDashboard, 
  Package, 
  FlaskConical, 
  ShoppingCart, 
  History, 
  Settings, 
  Plus, 
  RefreshCw,
  Search,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Pages
import Dashboard from './pages/Dashboard';
import Supplies from './pages/Supplies';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Config from './pages/Config';

export default function App() {
  const stockFlow = useStockFlow();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [skippedGitHub, setSkippedGitHub] = useState(() => localStorage.getItem('stockflow_skipped_gh') === 'true');

  if (!stockFlow.config && !skippedGitHub) {
    console.log('StockFlow: Initial configuration required');
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Config onSave={stockFlow.saveConfig} isInitial stockFlow={stockFlow} />
        <Toaster position="top-right" />
      </div>
    );
  }

  console.log('StockFlow: App initialized with config', stockFlow.config.owner);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'supplies', label: 'Insumos', icon: FlaskConical },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'sales', label: 'Vendas', icon: History },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Navigation Sidebar (Left) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary tracking-tight font-display">StockFlow</h1>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[1px] font-bold px-2 mb-3">Menu Principal</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150
                ${activeTab === item.id 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-3 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stockFlow.data.meta.lastSync ? 'bg-success' : 'bg-destructive'}`} />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">GitHub Sync</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={stockFlow.sync}
              disabled={stockFlow.isLoading}
            >
              <RefreshCw className={`w-3 h-3 ${stockFlow.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 text-[11px] font-medium">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Sincronizado
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-card border-border text-foreground hover:bg-muted"
              onClick={stockFlow.sync}
              disabled={stockFlow.isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${stockFlow.isLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === 'dashboard' && <Dashboard stockFlow={stockFlow} />}
              {activeTab === 'supplies' && <Supplies stockFlow={stockFlow} />}
              {activeTab === 'products' && <Products stockFlow={stockFlow} />}
              {activeTab === 'purchases' && <Purchases stockFlow={stockFlow} />}
              {activeTab === 'sales' && <Sales stockFlow={stockFlow} />}
              {activeTab === 'config' && <Config onSave={stockFlow.saveConfig} currentConfig={stockFlow.config} stockFlow={stockFlow} />}
            </div>
          </ScrollArea>

          {/* Activity Sidebar (Right) - Visible on large screens */}
          <aside className="hidden xl:flex w-72 border-l border-border bg-card/30 flex-col p-6 gap-6">
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[1px] mb-4">Últimas Atividades</h3>
              <div className="space-y-6">
                {stockFlow.data.sales.slice(0, 3).map((sale, i) => (
                  <div key={sale.id} className="relative pl-5 border-l-2 border-border pb-1">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 bg-border rounded-full" />
                    <p className="text-[10px] text-muted-foreground mb-1">Venda #{sale.id.slice(-4)}</p>
                    <p className="text-xs font-medium">R$ {sale.total.toLocaleString('pt-BR')}</p>
                  </div>
                ))}
                {stockFlow.data.purchases.slice(0, 2).map((purchase, i) => (
                  <div key={purchase.id} className="relative pl-5 border-l-2 border-border pb-1">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 bg-border rounded-full" />
                    <p className="text-[10px] text-muted-foreground mb-1">Compra de Insumos</p>
                    <p className="text-xs font-medium">R$ {purchase.totalCost.toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Sistema</p>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Versão</span>
                <span className="font-mono">v1.0.4</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
