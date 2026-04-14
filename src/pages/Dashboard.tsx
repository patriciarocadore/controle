/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStockFlow } from '../useStockFlow';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FlaskConical,
  ShoppingCart,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const { data } = stockFlow;

  const totalSales = data.sales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = data.sales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, item) => {
      const product = data.products.find(p => p.id === item.productId);
      return itemAcc + (product ? product.calculatedCost * item.quantity : 0);
    }, 0);
  }, 0);

  const profit = totalSales - totalCost;
  const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  const lowStockProducts = data.products.filter(p => p.currentStock < p.minStock);

  const recentSales = [...data.sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const metrics = [
    { 
      label: 'Vendas Totais', 
      value: `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Lucro Estimado', 
      value: `R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
    { 
      label: 'Margem Média', 
      value: `${profitMargin.toFixed(1)}%`, 
      icon: ArrowUpRight, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Alertas de Estoque', 
      value: lowStockProducts.length.toString(), 
      icon: AlertTriangle, 
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-md ${m.bg}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[1px] font-bold mb-2">{m.label}</p>
                <h3 className="text-2xl font-semibold font-mono text-foreground">{m.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border py-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Últimas Vendas</CardTitle>
              <History className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-3 px-6">Data</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-3 px-6">Total</TableHead>
                  <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-3 px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-sm">
                      Nenhuma venda recente.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border hover:bg-white/[0.03] transition-colors">
                      <TableCell className="text-xs text-muted-foreground px-6">
                        {format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-foreground px-6">
                        R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className="bg-success/10 text-success border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">Concluída</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border py-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Alertas de Estoque</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Tudo em ordem com o estoque!
              </div>
            ) : (
              <>
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white/[0.02] p-3 rounded-md border border-border">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.currentStock} un (mín {p.minStock})</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive text-[9px] font-bold uppercase tracking-tighter">Crítico</Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
