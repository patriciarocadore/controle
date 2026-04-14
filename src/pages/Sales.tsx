/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sale, SaleItem, Product } from '../types';
import { useStockFlow } from '../useStockFlow';
import { 
  Plus, 
  Search, 
  History, 
  Calendar as CalendarIcon,
  Trash2,
  Package,
  X,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function Sales({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [notes, setNotes] = useState('');

  const filteredSales = stockFlow.data.sales.filter(s => 
    s.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.items.some(i => {
      const product = stockFlow.data.products.find(p => p.id === i.productId);
      return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setDiscount('0');
    setPaymentMethod('Pix');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, priceAtSale: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // If product changed, update priceAtSale
    if (field === 'productId') {
      const product = stockFlow.data.products.find(p => p.id === value);
      if (product) {
        item.priceAtSale = product.salePrice;
      }
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSave = () => {
    if (items.length === 0) return;

    const subtotal = items.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);
    const d = parseFloat(discount) || 0;

    stockFlow.registerSale({
      date,
      items: items.filter(i => i.productId && i.quantity > 0),
      subtotal,
      discount: d,
      total: Math.max(0, subtotal - d),
      paymentMethod,
      notes,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-border pl-10 focus:ring-primary/20"
          />
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Data</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Produtos</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Total</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Pagamento</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Obs.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">Nenhuma venda registrada.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="border-border hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-medium text-xs text-foreground px-6 py-4">
                      {format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {sale.items.map((item, idx) => {
                          const product = stockFlow.data.products.find(p => p.id === item.productId);
                          return (
                            <Badge key={idx} variant="outline" className="bg-muted/50 border-border text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                              {product?.name} (x{item.quantity})
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground px-6">
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] uppercase tracking-wider">
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground max-w-[150px] truncate px-6">
                      {sale.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111118] border-white/10 text-[#f0f0f5] max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-display text-xl">Registrar Nova Venda</DialogTitle>
            <DialogDescription className="text-[#9090a8]">
              Selecione os produtos vendidos. O estoque será atualizado automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale-date" className="text-xs text-[#9090a8] uppercase tracking-wider">Data da Venda</Label>
                  <Input
                    id="sale-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-pay" className="text-xs text-[#9090a8] uppercase tracking-wider">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-[#18181f] border-white/5 h-10">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10 text-[#f0f0f5]">
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#f0f0f5]">Produtos na Venda</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddItem}
                    className="bg-[#18181f] border-white/5 text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar Produto
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const selectedProduct = stockFlow.data.products.find(p => p.id === item.productId);
                    const itemTotal = item.priceAtSale * item.quantity;

                    return (
                      <div key={index} className="flex items-end gap-3 bg-[#18181f]/30 p-3 rounded-lg border border-white/5">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Produto</Label>
                          <Select 
                            value={item.productId} 
                            onValueChange={(v) => handleUpdateItem(index, 'productId', v)}
                          >
                            <SelectTrigger className="bg-[#18181f] border-white/5 h-9 text-xs">
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111118] border-white/10 text-[#f0f0f5]">
                              {stockFlow.data.products.map(p => (
                                <SelectItem key={p.id} value={p.id} className="text-xs">
                                  {p.name} (Estoque: {p.currentStock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1.5">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Qtd</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="bg-[#18181f] border-white/5 h-9 text-xs"
                          />
                        </div>
                        <div className="w-24 space-y-1.5 text-right">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Total</Label>
                          <div className="h-9 flex items-center justify-end text-xs font-mono text-[#2dd4a0]">
                            R$ {itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-lg text-[#5a5a72] text-sm">
                      Adicione os produtos que foram vendidos.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale-discount" className="text-xs text-[#9090a8] uppercase tracking-wider">Desconto Total (R$)</Label>
                  <Input
                    id="sale-discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-notes" className="text-xs text-[#9090a8] uppercase tracking-wider">Observações / Cliente</Label>
                  <Input
                    id="sale-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                    placeholder="Nome do cliente, etc."
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-white/5">
            <div className="flex-1 flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#5a5a72] uppercase tracking-wider">Subtotal:</span>
                <span className="text-sm font-mono text-[#9090a8]">
                  R$ {items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5a5a72] uppercase tracking-wider">Total Final:</span>
                <span className="text-xl font-bold font-mono text-[#2dd4a0]">
                  R$ {Math.max(0, items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0) - (parseFloat(discount) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[#9090a8] hover:text-[#f0f0f5]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#7c6dfa] hover:bg-[#6c5de8] text-white" disabled={items.length === 0}>
              Finalizar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
