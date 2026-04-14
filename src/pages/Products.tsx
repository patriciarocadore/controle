/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Product, CompositionItem, Supply } from '../types';
import { useStockFlow } from '../useStockFlow';
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2, 
  FlaskConical,
  DollarSign,
  Info,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Products({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState<CompositionItem[]>([]);

  const filteredProducts = stockFlow.data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setCategory(product.category);
      setSalePrice(product.salePrice.toString());
      setMinStock(product.minStock.toString());
      setSku(product.sku || '');
      setDescription(product.description || '');
      setComposition([...product.composition]);
    } else {
      setEditingProduct(null);
      setName('');
      setCategory('');
      setSalePrice('0');
      setMinStock('0');
      setSku('');
      setDescription('');
      setComposition([]);
    }
    setIsModalOpen(true);
  };

  const handleAddCompositionItem = () => {
    setComposition([...composition, { supplyId: '', quantity: 0 }]);
  };

  const handleRemoveCompositionItem = (index: number) => {
    setComposition(composition.filter((_, i) => i !== index));
  };

  const handleUpdateCompositionItem = (index: number, field: keyof CompositionItem, value: any) => {
    const newComposition = [...composition];
    newComposition[index] = { ...newComposition[index], [field]: value };
    setComposition(newComposition);
  };

  const calculateCurrentCost = () => {
    return composition.reduce((acc, item) => {
      const supply = stockFlow.data.supplies.find(s => s.id === item.supplyId);
      return acc + (supply ? supply.currentPrice * item.quantity : 0);
    }, 0);
  };

  const handleSave = () => {
    if (!name || !salePrice) return;

    const productData = {
      name,
      category,
      salePrice: parseFloat(salePrice) || 0,
      minStock: parseFloat(minStock) || 0,
      sku,
      description,
      composition: composition.filter(c => c.supplyId && c.quantity > 0),
      currentStock: editingProduct ? editingProduct.currentStock : 0,
    };

    if (editingProduct) {
      stockFlow.updateProduct(editingProduct.id, productData);
    } else {
      stockFlow.addProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-border pl-10 focus:ring-primary/20"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Produto</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Categoria</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Custo</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Venda</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Margem</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Estoque</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">Nenhum produto encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const margin = product.salePrice - product.calculatedCost;
                  const marginPct = (margin / product.salePrice) * 100;
                  
                  return (
                    <TableRow key={product.id} className="border-border hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center border border-border">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{product.sku || 'Sem SKU'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className="bg-muted/50 border-border text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                          {product.category || 'Geral'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground px-6">
                        R$ {product.calculatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground px-6">
                        R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex flex-col items-end">
                          <span className={`text-[11px] font-bold ${marginPct > 30 ? 'text-success' : 'text-muted-foreground'}`}>
                            {marginPct.toFixed(1)}%
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono">
                            R$ {margin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <span className={`text-sm font-mono ${product.currentStock < product.minStock ? 'text-destructive font-bold' : 'text-foreground'}`}>
                          {product.currentStock} un
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => handleOpenModal(product)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111118] border-white/10 text-[#f0f0f5] max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-display text-xl">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription className="text-[#9090a8]">
              Configure o produto e sua composição para cálculo automático de custos.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-name" className="text-xs text-[#9090a8] uppercase tracking-wider">Nome do Produto *</Label>
                  <Input
                    id="prod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                    placeholder="Ex: Perfume Lavanda 50ml"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-cat" className="text-xs text-[#9090a8] uppercase tracking-wider">Categoria</Label>
                  <Input
                    id="prod-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                    placeholder="Ex: Perfumaria"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-price" className="text-xs text-[#9090a8] uppercase tracking-wider">Preço de Venda *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[10px] text-[#5a5a72]">R$</span>
                    <Input
                      id="prod-price"
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="bg-[#18181f] border-white/5 pl-8 focus:border-[#7c6dfa]/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-sku" className="text-xs text-[#9090a8] uppercase tracking-wider">SKU / Código</Label>
                  <Input
                    id="prod-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-min" className="text-xs text-[#9090a8] uppercase tracking-wider">Estoque Mínimo</Label>
                  <Input
                    id="prod-min"
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="bg-[#18181f] border-white/5 focus:border-[#7c6dfa]/50"
                  />
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Composition (BOM) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#f0f0f5]">Composição do Produto</h4>
                    <p className="text-[10px] text-[#5a5a72]">Selecione os insumos e as quantidades usadas.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCompositionItem}
                    className="bg-[#18181f] border-white/5 text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {composition.map((item, index) => {
                    const selectedSupply = stockFlow.data.supplies.find(s => s.id === item.supplyId);
                    const itemCost = selectedSupply ? selectedSupply.currentPrice * item.quantity : 0;

                    return (
                      <div key={index} className="flex items-end gap-3 bg-[#18181f]/30 p-3 rounded-lg border border-white/5">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Insumo</Label>
                          <Select 
                            value={item.supplyId} 
                            onValueChange={(v) => handleUpdateCompositionItem(index, 'supplyId', v)}
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
                        <div className="w-24 space-y-1.5">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Qtd ({selectedSupply?.unit || '—'})</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCompositionItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="bg-[#18181f] border-white/5 h-9 text-xs"
                          />
                        </div>
                        <div className="w-24 space-y-1.5 text-right">
                          <Label className="text-[10px] text-[#5a5a72] uppercase">Custo</Label>
                          <div className="h-9 flex items-center justify-end text-xs font-mono text-[#9090a8]">
                            R$ {itemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleRemoveCompositionItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {composition.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-white/5 rounded-lg text-[#5a5a72] text-xs">
                      Nenhum insumo adicionado à composição.
                    </div>
                  )}
                </div>

                {/* Cost Summary */}
                <div className="bg-[#18181f] p-4 rounded-lg border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2dd4a0]/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#2dd4a0]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#5a5a72] uppercase tracking-wider">Custo Total Calculado</p>
                      <p className="text-lg font-bold font-mono text-[#2dd4a0]">
                        R$ {calculateCurrentCost().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#5a5a72] uppercase tracking-wider">Margem Estimada</p>
                    <p className="text-sm font-medium text-[#f0f0f5]">
                      {(((parseFloat(salePrice) - calculateCurrentCost()) / parseFloat(salePrice)) * 100 || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[#9090a8] hover:text-[#f0f0f5]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#7c6dfa] hover:bg-[#6c5de8] text-white">
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
