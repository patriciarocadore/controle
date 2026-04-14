/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
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
  Box,
  Edit2,
  Trash2,
  Info,
  ChevronRight,
  CreditCard,
  Download,
  Upload,
  ShieldCheck,
  Github,
  Key,
  User,
  Database,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Supply, Product, CompositionItem, Purchase, PurchaseItem, Sale, SaleItem, GitHubConfig } from './types';

// --- Dashboard Component ---
function Dashboard({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const totalSales = stockFlow.data.sales.reduce((acc, s) => acc + s.total, 0);
  const totalPurchases = stockFlow.data.purchases.reduce((acc, p) => acc + p.totalCost, 0);
  const stockValue = stockFlow.data.products.reduce((acc, p) => acc + (p.calculatedCost * p.currentStock), 0);
  
  const lowStockProducts = stockFlow.data.products.filter(p => p.currentStock < p.minStock);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vendas Totais</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">R$ {totalSales.toLocaleString('pt-BR')}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Acumulado histórico</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Investimento em Compras</CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">R$ {totalPurchases.toLocaleString('pt-BR')}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total gasto em insumos</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Valor em Estoque</CardTitle>
            <Box className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">R$ {stockValue.toLocaleString('pt-BR')}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Custo total dos produtos</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alertas de Estoque</CardTitle>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{lowStockProducts.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Tudo em dia com o estoque!</p>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">Mínimo: {p.minStock} un</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-[10px] font-bold">{p.currentStock} un</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center py-10">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Lucro Bruto Estimado</p>
              <div className="text-4xl font-black text-success font-mono">
                R$ {(totalSales - totalPurchases).toLocaleString('pt-BR')}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic">Baseado em vendas vs compras totais</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Supplies Component ---
function Supplies({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('un');

  const filteredSupplies = stockFlow.data.supplies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply);
      setName(supply.name);
      setCategory(supply.category);
      setUnit(supply.unit);
    } else {
      setEditingSupply(null);
      setName('');
      setCategory('');
      setUnit('un');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name) return;
    const supplyData = { 
      name, 
      category, 
      unit: unit as any, 
      currentPrice: editingSupply?.currentPrice || 0, 
      currentStock: editingSupply?.currentStock || 0,
      purchasePrice: editingSupply?.purchasePrice || 0,
      packageSize: editingSupply?.packageSize || 1
    };
    if (editingSupply) {
      stockFlow.updateSupply(editingSupply.id, supplyData);
    } else {
      stockFlow.addSupply(supplyData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-border pl-10"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Insumo
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Nome</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Categoria</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Unidade</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">Nenhum insumo encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredSupplies.map((supply) => (
                  <TableRow key={supply.id} className="border-border hover:bg-white/[0.02]">
                    <TableCell className="px-6 py-4 font-medium">{supply.name}</TableCell>
                    <TableCell className="px-6">
                      <Badge variant="outline" className="bg-muted/50 border-border text-[10px] uppercase tracking-wider">{supply.category || 'Geral'}</Badge>
                    </TableCell>
                    <TableCell className="px-6 text-sm text-muted-foreground">{supply.unit}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(supply)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingSupply ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Insumo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Essência de Lavanda" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Matéria-prima" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="l">Litro (l)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full">Salvar Insumo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Products Component ---
function Products({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [composition, setComposition] = useState<CompositionItem[]>([]);

  const filteredProducts = stockFlow.data.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setCategory(product.category);
      setSalePrice(product.salePrice.toString());
      setMinStock(product.minStock.toString());
      setComposition([...product.composition]);
    } else {
      setEditingProduct(null);
      setName('');
      setCategory('');
      setSalePrice('0');
      setMinStock('0');
      setComposition([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name) return;
    const productData = {
      name, category, salePrice: parseFloat(salePrice) || 0, minStock: parseFloat(minStock) || 0,
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
          <Input placeholder="Buscar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-card border-border pl-10" />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Produto</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Custo</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Venda</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Estoque</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-white/[0.02]">
                  <TableCell className="px-6 py-4 font-medium">{product.name}</TableCell>
                  <TableCell className="text-right font-mono text-sm px-6">R$ {product.calculatedCost.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-mono text-sm px-6">R$ {product.salePrice.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right px-6">
                    <span className={product.currentStock < product.minStock ? 'text-destructive font-bold' : ''}>{product.currentStock} un</span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(product)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Preço de Venda</Label><Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></div>
              <div className="space-y-2"><Label>Estoque Mínimo</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h4 className="text-sm font-bold">Composição</h4><Button size="sm" variant="outline" onClick={() => setComposition([...composition, { supplyId: '', quantity: 0 }])}><Plus className="w-3 h-3 mr-1" /> Item</Button></div>
              {composition.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1"><Select value={item.supplyId} onValueChange={(v) => { const n = [...composition]; n[idx].supplyId = v; setComposition(n); }}><SelectTrigger><SelectValue placeholder="Insumo" /></SelectTrigger><SelectContent>{stockFlow.data.supplies.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>)}</SelectContent></Select></div>
                  <div className="w-24"><Input type="number" value={item.quantity} onChange={(e) => { const n = [...composition]; n[idx].quantity = parseFloat(e.target.value) || 0; setComposition(n); }} /></div>
                  <Button variant="ghost" size="icon" onClick={() => setComposition(composition.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="w-full">Salvar Produto</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Purchases Component ---
function Purchases({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [shippingCost, setShippingCost] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'debit' | 'credit' | 'transfer'>('money');
  const [installments, setInstallments] = useState('1');

  const handleSave = () => {
    if (items.length === 0) return;
    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const ship = parseFloat(shippingCost) || 0;
    stockFlow.registerPurchase({ 
      date, 
      items: items.filter(i => i.supplyId && i.quantity > 0), 
      shippingCost: ship, 
      totalCost: subtotal + ship, 
      paymentMethod, 
      installments: parseInt(installments) || 1 
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button onClick={() => { setItems([]); setShippingCost('0'); setIsModalOpen(true); }} className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Nova Compra</Button></div>
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="px-6">Data</TableHead><TableHead className="px-6">Itens</TableHead><TableHead className="px-6 text-right">Total</TableHead><TableHead className="px-6">Pagamento</TableHead></TableRow></TableHeader>
            <TableBody>
              {stockFlow.data.purchases.map((p) => (
                <TableRow key={p.id} className="border-border">
                  <TableCell className="px-6">{format(new Date(p.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="px-6">{p.items.length} itens</TableCell>
                  <TableCell className="px-6 text-right font-mono">R$ {p.totalCost.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="px-6"><Badge variant="outline">{p.paymentMethod} {p.installments && p.installments > 1 ? `(${p.installments}x)` : ''}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Registrar Compra</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Frete (R$)</Label><Input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Pagamento</Label><Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="money">Dinheiro</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="credit">Crédito</SelectItem><SelectItem value="debit">Débito</SelectItem><SelectItem value="transfer">Transferência</SelectItem></SelectContent></Select></div>
              {paymentMethod === 'credit' && <div className="space-y-2"><Label>Parcelas</Label><Input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} /></div>}
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h4 className="text-sm font-bold">Itens da Compra</h4><Button size="sm" variant="outline" onClick={() => setItems([...items, { supplyId: '', quantity: 1, packageSize: 1, price: 0 }])}><Plus className="w-3 h-3 mr-1" /> Item</Button></div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end bg-muted/20 p-3 rounded-lg border border-border">
                  <div className="flex-1"><Label className="text-[10px] uppercase">Insumo</Label><Select value={item.supplyId} onValueChange={(v) => { const n = [...items]; n[idx].supplyId = v; setItems(n); }}><SelectTrigger><SelectValue placeholder="Insumo" /></SelectTrigger><SelectContent>{stockFlow.data.supplies.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>)}</SelectContent></Select></div>
                  <div className="w-20"><Label className="text-[10px] uppercase">Qtd Pct</Label><Input type="number" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = parseFloat(e.target.value) || 0; setItems(n); }} /></div>
                  <div className="w-24"><Label className="text-[10px] uppercase">Tam Pct</Label><Input type="number" value={item.packageSize} onChange={(e) => { const n = [...items]; n[idx].packageSize = parseFloat(e.target.value) || 0; setItems(n); }} /></div>
                  <div className="w-24"><Label className="text-[10px] uppercase">R$ Pct</Label><Input type="number" value={item.price} onChange={(e) => { const n = [...items]; n[idx].price = parseFloat(e.target.value) || 0; setItems(n); }} /></div>
                  <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="w-full">Finalizar Compra</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sales Component ---
function Sales({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  const handleSave = () => {
    if (items.length === 0) return;
    const subtotal = items.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0);
    stockFlow.registerSale({ date: new Date().toISOString().split('T')[0], items: items.filter(i => i.productId && i.quantity > 0), subtotal, discount: 0, total: subtotal, paymentMethod, notes: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button onClick={() => { setItems([]); setIsModalOpen(true); }} className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Nova Venda</Button></div>
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="px-6">Data</TableHead><TableHead className="px-6">Produtos</TableHead><TableHead className="px-6 text-right">Total</TableHead><TableHead className="px-6">Pagamento</TableHead></TableRow></TableHeader>
            <TableBody>
              {stockFlow.data.sales.map((s) => (
                <TableRow key={s.id} className="border-border">
                  <TableCell className="px-6">{format(new Date(s.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="px-6">{s.items.length} itens</TableCell>
                  <TableCell className="px-6 text-right font-mono">R$ {s.total.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="px-6"><Badge variant="outline">{s.paymentMethod}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Venda</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2"><Label>Pagamento</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pix">Pix</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem><SelectItem value="Cartão">Cartão</SelectItem></SelectContent></Select></div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h4 className="text-sm font-bold">Produtos</h4><Button size="sm" variant="outline" onClick={() => setItems([...items, { productId: '', quantity: 1, priceAtSale: 0 }])}><Plus className="w-3 h-3 mr-1" /> Item</Button></div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1"><Select value={item.productId} onValueChange={(v) => { const n = [...items]; n[idx].productId = v; const p = stockFlow.data.products.find(x => x.id === v); if (p) n[idx].priceAtSale = p.salePrice; setItems(n); }}><SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger><SelectContent>{stockFlow.data.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Estoque: {p.currentStock})</SelectItem>)}</SelectContent></Select></div>
                  <div className="w-24"><Input type="number" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = parseInt(e.target.value) || 0; setItems(n); }} /></div>
                  <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="w-full">Finalizar Venda</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Config Component ---
function Config({ onSave, currentConfig, isInitial, stockFlow }: { onSave: (c: GitHubConfig) => void, currentConfig?: GitHubConfig | null, isInitial?: boolean, stockFlow?: ReturnType<typeof useStockFlow> }) {
  const [token, setToken] = useState(currentConfig?.token || '');
  const [owner, setOwner] = useState(currentConfig?.owner || '');
  const [repo, setRepo] = useState(currentConfig?.repo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkip = () => { localStorage.setItem('stockflow_skipped_gh', 'true'); window.location.reload(); };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader><div className="flex items-center gap-2 mb-2"><ShieldCheck className="w-6 h-6 text-primary" /><CardTitle className="text-xl font-display">Segurança e Backup</CardTitle></div><CardDescription>Seus dados são salvos no navegador. Use as opções abaixo para backups manuais.</CardDescription></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={() => stockFlow?.exportData()}><Download className="w-4 h-4 mr-2" /> Exportar Backup (JSON)</Button>
          <div className="flex-1"><input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => { const file = e.target.files?.[0]; if (file) stockFlow?.importData(file); }} /><Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Importar Backup</Button></div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border shadow-sm">
        <CardHeader><div className="flex items-center gap-2 mb-2"><Github className="w-6 h-6 text-primary" /><CardTitle className="text-xl font-display">Sincronização GitHub (Opcional)</CardTitle></div><CardDescription>Conecte seu repositório para manter seus dados sincronizados. Salva em stockflow_data.json na raiz.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>GitHub Token</Label><Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_..." /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Usuário</Label><Input value={owner} onChange={(e) => setOwner(e.target.value)} /></div><div className="space-y-2"><Label>Repositório</Label><Input value={repo} onChange={(e) => setRepo(e.target.value)} /></div></div>
          <div className="flex flex-col gap-3 pt-4"><Button onClick={() => onSave({ token, owner, repo })} disabled={!token || !owner || !repo}>Conectar GitHub</Button>{isInitial && <Button variant="ghost" onClick={handleSkip}>Continuar sem GitHub (Apenas Local)</Button>}</div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const stockFlow = useStockFlow();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [skippedGitHub, setSkippedGitHub] = useState(() => localStorage.getItem('stockflow_skipped_gh') === 'true');

  if (!stockFlow.config && !skippedGitHub) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Config onSave={stockFlow.saveConfig} isInitial stockFlow={stockFlow} />
        <Toaster position="top-right" />
      </div>
    );
  }

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-border transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-border"><h1 className="text-xl font-bold text-primary tracking-tight font-display">StockFlow</h1></div>
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-3 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${stockFlow.data.meta.lastSync ? 'bg-success' : 'bg-destructive'}`} /><span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">GitHub Sync</span></div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={stockFlow.sync} disabled={stockFlow.isLoading}><RefreshCw className={`w-3 h-3 ${stockFlow.isLoading ? 'animate-spin' : ''}`} /></Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4"><Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</Button><h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{activeTab}</h2></div>
          <div className="flex items-center gap-4"><Button variant="outline" size="sm" onClick={stockFlow.sync} disabled={stockFlow.isLoading}><RefreshCw className={`w-3.5 h-3.5 mr-2 ${stockFlow.isLoading ? 'animate-spin' : ''}`} /> Sincronizar</Button></div>
        </header>

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
      </div>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
