/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GitHubConfig } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Github, Key, User, Database, Download, Upload, ShieldCheck } from 'lucide-react';
import { useStockFlow } from '../useStockFlow';

interface ConfigProps {
  onSave: (config: GitHubConfig) => void;
  currentConfig?: GitHubConfig | null;
  isInitial?: boolean;
  stockFlow?: ReturnType<typeof useStockFlow>;
}

export default function Config({ onSave, currentConfig, isInitial, stockFlow }: ConfigProps) {
  const [token, setToken] = useState(currentConfig?.token || '');
  const [owner, setOwner] = useState(currentConfig?.owner || '');
  const [repo, setRepo] = useState(currentConfig?.repo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!token || !owner || !repo) return;
    onSave({ token, owner, repo });
  };

  const handleSkip = () => {
    // Save a dummy config to bypass the initial screen if requested
    // or just let the App.tsx handle the "skip" logic
    localStorage.setItem('stockflow_skipped_gh', 'true');
    window.location.reload();
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl font-display">Segurança e Backup</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Seus dados são salvos automaticamente no seu navegador. Use as opções abaixo para fazer backups manuais.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1 border-border hover:bg-muted"
            onClick={() => stockFlow?.exportData()}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Backup (JSON)
          </Button>
          
          <div className="flex-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) stockFlow?.importData(file);
              }}
            />
            <Button 
              variant="outline" 
              className="w-full border-border hover:bg-muted"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Github className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl font-display">Sincronização GitHub (Opcional)</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Conecte seu repositório para manter seus dados sincronizados entre diferentes dispositivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">GitHub Personal Access Token</Label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                id="token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-muted/50 border-border pl-10 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="owner"
                  placeholder="seu-usuario"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="bg-muted/50 border-border pl-10 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Repositório</Label>
              <div className="relative">
                <Database className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="repo"
                  placeholder="nome-do-repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="bg-muted/50 border-border pl-10 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={!token || !owner || !repo}
            >
              Conectar GitHub
            </Button>
            
            {isInitial && (
              <Button 
                variant="ghost"
                onClick={handleSkip} 
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Continuar sem GitHub (Apenas Local)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
