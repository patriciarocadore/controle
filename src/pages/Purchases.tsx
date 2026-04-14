/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Purchase, PurchaseItem, Supply } from '../types';
import { useStockFlow } from '../useStockFlow';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Calendar as CalendarIcon,
  Trash2,
  FlaskConical,
  X,
  History
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

export default function Purchases({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<Purchase['paymentMethod']>('money');
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState('');

  const filteredPurchases = stockFlow.data.purchases.filter(p => 
    p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.items.some(i => {
      const supply = stockFlow.data.supplies.find(s => s.id === i.supplyId);
      return supply?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setShippingCost(0);
    setPaymentMethod('money');
    setInstallments(1);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { supplyId: '', quantity: 1, packageSize: 0, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (items.length === 0) return;

    const itemsTotal = items.reduce((acc, item) => acc + item.price, 0);
    const totalCost = itemsTotal + shippingCost;

    stockFlow.registerPurchase({
      date,
      items: items.filter(i => i.supplyId && i.price > 0),
      totalCost,
      shippingCost,
      paymentMethod,
      installments: paymentMethod === 'credit' ? installments : undefined,
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
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-border pl-10 focus:ring-primary/20"
          />
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Compra
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Data</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Insumos Comprados</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Valor Total</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Pagamento</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">Nenhuma compra registrada.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="border-border hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-medium text-xs text-foreground px-6 py-4">
                      {format(new Date(purchase.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {purchase.items.map((item, idx) => {
                          const supply = stockFlow.data.supplies.find(s => s.id === item.supplyId);
                          return (
                            <Badge key={idx} variant="outline" className="bg-muted/50 border-border text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                              {supply?.name} ({item.quantity}x {item.packageSize}{supply?.unit})
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground px-6">
                      R$ {purchase.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className="w-fit bg-primary/10 border-primary/20 text-[9px] text-primary font-bold uppercase">
                          {purchase.paymentMethod === 'money' && 'Dinheiro'}
                          {purchase.paymentMethod === 'pix' && 'PIX'}
                          {purchase.paymentMethod === 'debit' && 'Débito'}
                          {purchase.paymentMethod === 'credit' && 'Crédito'}
                          {purchase.paymentMethod === 'transfer' && 'Transferência'}
                        </Badge>
                        {purchase.paymentMethod === 'credit' && purchase.installments && (
                          <span className="text-[10px] text-muted-foreground">
                            {purchase.installments}x de R$ {(purchase.totalCost / purchase.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground max-w-[200px] truncate px-6">
                      {purchase.notes || '—'}
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
            <DialogTitle className="font-display text-xl">Registrar Compra de Insumos</DialogTitle>
            <DialogDescription className="text-[#9090a8]">
              Ao registrar uma compra, o estoque dos insumos será atualizado e o custo médio será recalculado.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pur-date" className="text-xs text-[#9090a8] uppercase tracking-wider">Data da Compra</Label>
                  <Input
                    id="pur-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pur-shipping" className="text-xs text-[#9090a8] uppercase tracking-wider">Frete (R$)</Label>
                  <Input
                    id="pur-shipping"
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50 font-mono"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pur-notes" className="text-xs text-[#9090a8] uppercase tracking-wider">Observações / Fornecedor</Label>
                  <Input
                    id="pur-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                    placeholder="Ex: Fornecedor X, NF 123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pur-payment" className="text-xs text-[#9090a8] uppercase tracking-wider">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <SelectTrigger className="bg-[#18181f] border-white/5 h-9 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10 text-[#f0f0f5]">
                      <SelectItem value="money" className="text-xs">Dinheiro</SelectItem>
                      <SelectItem value="pix" className="text-xs">PIX</SelectItem>
                      <SelectItem value="debit" className="text-xs">Cartão de Débito</SelectItem>
                      <SelectItem value="credit" className="text-xs">Cartão de Crédito</SelectItem>
                      <SelectItem value="transfer" className="text-xs">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === 'credit' && (
                  <div className="space-y-2">
                    <Label htmlFor="pur-installments" className="text-xs text-[#9090a8] uppercase tracking-wider">Parcelas</Label>
                    <Input
                      id="pur-installments"
                      type="number"
                      min="1"
                      max="48"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                      className="bg-[#18181f] border-white/5 h-9 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#f0f0f5]">Itens da Compra</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddItem}
                    className="bg-[#18181f] border-white/5 text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar Insumo
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const selectedSupply = stockFlow.data.supplies.find(s => s.id === item.supplyId);
                    
                    const itemsTotal = items.reduce((acc, i) => acc + i.price, 0);
                    const shippingFactor = itemsTotal > 0 ? (itemsTotal + shippingCost) / itemsTotal : 1;
                    const itemPriceWithShipping = item.price * shippingFactor;
                    const unitPrice = itemPriceWithShipping / (item.packageSize * item.quantity) || 0;

                    return (
                      <div key={index} className="space-y-3 bg-[#18181f]/30 p-4 rounded-lg border border-white/5">
                        <div className="flex items-end gap-3">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-[10px] text-[#5a5a72] uppercase">Insumo</Label>
                            <Select 
                              value={item.supplyId} 
                              onValueChange={(v) => handleUpdateItem(index, 'supplyId', v)}
                            >
                              <SelectTrigger className="bg-[#18181f] border-white/5 h-9 text-xs">
                                <SelectValue placeholder="Selecione o insumo" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#111118] border-white/10 text-[#f0f0f5]">
                                {stockFlow.data.supplies.map(s => (
                                  <SelectItem key={s.id} value={s.id} className="text-xs">
                                    {s.name} ({s.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] text-[#5a5a72] uppercase">Qtd Embalagens</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="bg-[#18181f] border-white/5 h-9 text-xs"
                              placeholder="1"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] text-[#5a5a72] uppercase">Tamanho Emb. ({selectedSupply?.unit || '—'})</Label>
                            <Input
                              type="number"
                              value={item.packageSize}
                              onChange={(e) => handleUpdateItem(index, 'packageSize', parseFloat(e.target.value) || 0)}
                              className="bg-[#18181f] border-white/5 h-9 text-xs"
                              placeholder="Ex: 50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] text-[#5a5a72] uppercase">Preço Total (R$)</Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                              className="bg-[#18181f] border-white/5 h-9 text-xs"
                              placeholder="0,00"
                            />
                          </div>
                        </div>

                        {item.price > 0 && item.packageSize > 0 && (
                          <div className="flex justify-between items-center text-[10px] text-[#5a5a72] pt-1">
                            <span>Novo Custo Unitário:</span>
                            <span className="font-mono text-[#2dd4a0]">
                              R$ {unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 4 })} / {selectedSupply?.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-lg text-[#5a5a72] text-sm">
                      Adicione os insumos que você comprou.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-white/5">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#5a5a72] uppercase tracking-wider">Subtotal Itens:</span>
                <span className="text-sm font-mono text-[#f0f0f5]">
                  R$ {items.reduce((acc, i) => acc + i.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5a5a72] uppercase tracking-wider">Total com Frete:</span>
                <span className="text-lg font-bold font-mono text-[#2dd4a0]">
                  R$ {(items.reduce((acc, i) => acc + i.price, 0) + shippingCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[#9090a8] hover:text-[#f0f0f5]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#7c6dfa] hover:bg-[#6c5de8] text-white" disabled={items.length === 0}>
              Finalizar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
