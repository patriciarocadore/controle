/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Supply, Unit } from '../types';
import { useStockFlow } from '../useStockFlow';
import { 
  Plus, 
  Search, 
  FlaskConical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Supplies({ stockFlow }: { stockFlow: ReturnType<typeof useStockFlow> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('ml');
  const [category, setCategory] = useState('');

  const filteredSupplies = stockFlow.data.supplies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply);
      setName(supply.name);
      setUnit(supply.unit);
      setCategory(supply.category || '');
    } else {
      setEditingSupply(null);
      setName('');
      setUnit('ml');
      setCategory('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name) return;

    if (editingSupply) {
      stockFlow.updateSupply(editingSupply.id, {
        name,
        unit,
        category,
      });
    } else {
      stockFlow.addSupply({
        name,
        unit,
        currentPrice: 0,
        purchasePrice: 0,
        packageSize: 0,
        currentStock: 0,
        category,
      });
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
            className="bg-card border-border pl-10 focus:ring-primary/20"
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
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Insumo</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Categoria</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold py-4 px-6">Unidade</TableHead>
                <TableHead className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold text-right py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                    <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">Nenhum insumo encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSupplies.map((supply) => (
                  <TableRow key={supply.id} className="border-border hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center border border-border">
                          <FlaskConical className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{supply.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge variant="outline" className="bg-muted/50 border-border text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                        {supply.category || 'Geral'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs px-6">{supply.unit}</TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => handleOpenModal(supply)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {editingSupply ? 'Editar Insumo' : 'Novo Insumo'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Cadastre os insumos básicos que compõem seus produtos finais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Nome do Insumo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted/50 border-border focus:ring-primary/20"
                placeholder="Ex: Essência de Lavanda"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Unidade</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                    <SelectItem value="L">Litros (L)</SelectItem>
                    <SelectItem value="g">Gramas (g)</SelectItem>
                    <SelectItem value="kg">Quilos (kg)</SelectItem>
                    <SelectItem value="un">Unidades (un)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-muted/50 border-border focus:ring-primary/20"
                placeholder="Ex: Fragrâncias, Solventes..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Salvar Insumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
